"use client";

import { bytesToBase64, decryptBook } from "./bytes";
import {
  deleteBookKey,
  getDeviceLabel,
  getOrCreateDeviceId,
  loadBookKey,
  saveBookKey,
} from "./device";
import { isNativeApp } from "./native";

/**
 * The on-device offline library.
 *
 *   encrypted book bytes  ->  Filesystem, Directory.Data, library/<id>.enc
 *   AES key / iv / tag    ->  platform keystore (see device.ts)
 *   catalogue             ->  Preferences, key "bbs_library"
 *
 * Books are permanent: nothing here expires or phones home to revalidate.
 * The only server call is at download time, and an optional reconcile
 * that hides books belonging to a different signed-in account.
 */

export interface LocalBook {
  downloadId: number;
  bookId: number;
  title: string;
  author: string;
  watermark: { email: string | null; phone: string };
  addedAt: number;
}

export class DeviceLimitError extends Error {
  devices: { id: number; label: string | null; addedAt: string }[];
  constructor(
    message: string,
    devices: { id: number; label: string | null; addedAt: string }[]
  ) {
    super(message);
    this.name = "DeviceLimitError";
    this.devices = devices;
  }
}

const INDEX_KEY = "bbs_library";
const filePath = (downloadId: number) => `library/${downloadId}.enc`;

async function fs() {
  const mod = await import("@capacitor/filesystem");
  return mod;
}

async function prefs() {
  const { Preferences } = await import("@capacitor/preferences");
  return Preferences;
}

async function readIndex(): Promise<LocalBook[]> {
  const { value } = await (await prefs()).get({ key: INDEX_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as LocalBook[];
  } catch {
    return [];
  }
}

async function writeIndex(list: LocalBook[]): Promise<void> {
  await (await prefs()).set({ key: INDEX_KEY, value: JSON.stringify(list) });
}

/* ---------- device registration ---------- */

async function registerDevice(deviceId: string): Promise<void> {
  const res = await fetch("/api/customer/devices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      platform: "android",
      label: await getDeviceLabel(),
    }),
  });

  if (res.ok) return;

  const body = await res.json().catch(() => ({}));

  if (res.status === 409 && body.reason === "device_limit") {
    throw new DeviceLimitError(
      body.message ?? "Device limit reached.",
      (body.devices ?? []).map(
        (d: { id: number; label: string | null; addedAt: string }) => ({
          id: d.id,
          label: d.label,
          addedAt: d.addedAt,
        })
      )
    );
  }

  throw new Error(body.message ?? "Could not register this device.");
}

/* ---------- download ---------- */

export async function downloadBook(bookId: number): Promise<LocalBook> {
  if (!isNativeApp()) {
    throw new Error("Offline downloads are only available in the app.");
  }

  const deviceId = await getOrCreateDeviceId();
  await registerDevice(deviceId);

  const res = await fetch("/api/customer/downloads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId, deviceId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Download failed.");
  }

  const h = res.headers;
  const downloadId = Number(h.get("X-Download-Id"));
  const book: LocalBook = {
    downloadId,
    bookId,
    title: decodeURIComponent(h.get("X-Book-Title") ?? ""),
    author: decodeURIComponent(h.get("X-Book-Author") ?? ""),
    watermark: {
      email: decodeURIComponent(h.get("X-Watermark-Email") ?? "") || null,
      phone: decodeURIComponent(h.get("X-Watermark-Phone") ?? ""),
    },
    addedAt: Date.now(),
  };

  const cipher = new Uint8Array(await res.arrayBuffer());

  const { Filesystem, Directory } = await fs();
  await Filesystem.mkdir({
    path: "library",
    directory: Directory.Data,
    recursive: true,
  }).catch(() => undefined);

  await Filesystem.writeFile({
    path: filePath(downloadId),
    data: bytesToBase64(cipher),
    directory: Directory.Data,
  });

  await saveBookKey(downloadId, {
    key: h.get("X-Content-Key") ?? "",
    iv: h.get("X-Content-Iv") ?? "",
    tag: h.get("X-Content-Tag") ?? "",
  });

  const list = (await readIndex()).filter(
    (b) => b.downloadId !== downloadId
  );
  list.unshift(book);
  await writeIndex(list);

  return book;
}

/* ---------- read ---------- */

/** Decrypted PDF bytes for the in-app reader. Never written back to disk. */
export async function openBook(downloadId: number): Promise<{
  bytes: ArrayBuffer;
  meta: LocalBook;
}> {
  const meta = (await readIndex()).find((b) => b.downloadId === downloadId);
  if (!meta) throw new Error("This book isn't on your device.");

  const key = await loadBookKey(downloadId);
  if (!key) throw new Error("Missing decryption key for this book.");

  const { Filesystem, Directory } = await fs();
  const { data } = await Filesystem.readFile({
    path: filePath(downloadId),
    directory: Directory.Data,
  });

  const { base64ToBytes } = await import("./bytes");
  const cipher = base64ToBytes(data as string);
  const bytes = await decryptBook(cipher, key.key, key.iv, key.tag);

  return { bytes, meta };
}

/* ---------- list / remove ---------- */

export async function listBooks(): Promise<LocalBook[]> {
  if (!isNativeApp()) return [];
  const local = await readIndex();

  // Hide books that belong to a different signed-in account. If the
  // request fails (offline, or logged out) fall back to everything on
  // the device — they were downloaded here and stay readable.
  try {
    const deviceId = await getOrCreateDeviceId();
    const res = await fetch(
      `/api/customer/downloads?deviceId=${encodeURIComponent(deviceId)}`
    );
    if (res.ok) {
      const body = await res.json();
      const allowed = new Set<number>(
        (body.books ?? []).map((b: { downloadId: number }) => b.downloadId)
      );
      return local.filter((b) => allowed.has(b.downloadId));
    }
  } catch {
    /* offline — show all local */
  }

  return local;
}

export async function removeBook(downloadId: number): Promise<void> {
  const { Filesystem, Directory } = await fs();
  await Filesystem.deleteFile({
    path: filePath(downloadId),
    directory: Directory.Data,
  }).catch(() => undefined);

  await deleteBookKey(downloadId);
  await writeIndex(
    (await readIndex()).filter((b) => b.downloadId !== downloadId)
  );

  // Best-effort server cleanup; local removal is what matters.
  fetch(`/api/customer/downloads/${downloadId}`, { method: "DELETE" }).catch(
    () => undefined
  );
}
