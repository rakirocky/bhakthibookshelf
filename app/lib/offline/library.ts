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
  const mod = await import("@capacitor/preferences");
  // Return the module, not the bare `Preferences` proxy: an async
  // function returning a Capacitor plugin proxy makes the promise
  // machinery read `.then` on it, which Capacitor turns into a native
  // call ("Preferences.then() is not implemented on android").
  return mod;
}

async function readIndex(): Promise<LocalBook[]> {
  const { Preferences } = await prefs();
  const { value } = await Preferences.get({ key: INDEX_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as LocalBook[];
  } catch {
    return [];
  }
}

async function writeIndex(list: LocalBook[]): Promise<void> {
  const { Preferences } = await prefs();
  await Preferences.set({ key: INDEX_KEY, value: JSON.stringify(list) });
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

/**
 * Take an encrypted-download response (from POST /downloads or
 * .../restore — identical wire format), write the ciphertext to
 * app-private storage, stash the key in the keystore, and upsert the
 * catalogue entry. Shared by first download and reconcile-restore.
 */
async function persistDownloadResponse(
  res: Response,
  bookId: number
): Promise<LocalBook> {
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

  return persistDownloadResponse(res, bookId);
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

/** Wipe a book's local footprint — file, keystore key, catalogue row. */
async function removeBookLocal(downloadId: number): Promise<void> {
  const { Filesystem, Directory } = await fs();
  await Filesystem.deleteFile({
    path: filePath(downloadId),
    directory: Directory.Data,
  }).catch(() => undefined);

  await deleteBookKey(downloadId);
  await writeIndex(
    (await readIndex()).filter((b) => b.downloadId !== downloadId)
  );
}

export interface LocalBookDetail extends LocalBook {
  /** Encrypted file size on disk, bytes. */
  sizeBytes: number;
  /** false once the book is unpublished — readable, but not re-downloadable. */
  available: boolean;
}

/**
 * The Downloads screen view: every book on the device, each with its
 * on-disk size and whether it's still offered by the store. Availability
 * comes from the server when reachable; offline, everything is assumed
 * available (it stays readable regardless).
 */
export async function listBooksDetailed(): Promise<{
  books: LocalBookDetail[];
  totalBytes: number;
}> {
  const books = await listBooks();

  let availability: Map<number, boolean> | null = null;
  try {
    const deviceId = await getOrCreateDeviceId();
    const res = await fetch(
      `/api/customer/downloads?deviceId=${encodeURIComponent(deviceId)}`
    );
    if (res.ok) {
      const body = await res.json();
      availability = new Map(
        (body.books ?? []).map(
          (b: { downloadId: number; available?: boolean }) => [
            b.downloadId,
            b.available !== false,
          ]
        )
      );
    }
  } catch {
    /* offline */
  }

  const detailed = await Promise.all(
    books.map(async (b) => ({
      ...b,
      sizeBytes: await bookFileSize(b.downloadId),
      available: availability?.get(b.downloadId) ?? true,
    }))
  );

  return {
    books: detailed,
    totalBytes: detailed.reduce((sum, b) => sum + b.sizeBytes, 0),
  };
}

export async function removeBook(downloadId: number): Promise<void> {
  await removeBookLocal(downloadId);

  // Best-effort server cleanup — revokes the licence so it isn't restored
  // on the next reconcile and frees the device's book slot.
  fetch(`/api/customer/downloads/${downloadId}`, { method: "DELETE" }).catch(
    () => undefined
  );
}

/** On-disk size of one downloaded book's encrypted file, in bytes. */
export async function bookFileSize(downloadId: number): Promise<number> {
  try {
    const { Filesystem, Directory } = await fs();
    const stat = await Filesystem.stat({
      path: filePath(downloadId),
      directory: Directory.Data,
    });
    return typeof stat.size === "number" ? stat.size : 0;
  } catch {
    return 0;
  }
}

async function fileExists(downloadId: number): Promise<boolean> {
  try {
    const { Filesystem, Directory } = await fs();
    await Filesystem.stat({
      path: filePath(downloadId),
      directory: Directory.Data,
    });
    return true;
  } catch {
    return false;
  }
}

/* ---------- reconcile ---------- */

export interface ReconcileResult {
  dropped: number;
  restored: number;
  unavailable: number;
}

interface LicensedBook {
  downloadId: number;
  bookId: number;
  available: boolean;
}

/**
 * Bring the local library in line with the server's record for this
 * device:
 *   - drop books the server no longer licenses here (removed on another
 *     device, or revoked by an admin after a refund),
 *   - restore books that are licensed but missing locally (the device was
 *     wiped / the app reinstalled).
 *
 * Offline or logged out, the server call fails and this is a no-op —
 * everything on the device stays exactly as it is.
 */
export async function reconcileLibrary(): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    dropped: 0,
    restored: 0,
    unavailable: 0,
  };

  if (!isNativeApp()) return result;

  const deviceId = await getOrCreateDeviceId();

  let licensed: LicensedBook[];
  try {
    const res = await fetch(
      `/api/customer/downloads?deviceId=${encodeURIComponent(deviceId)}`
    );
    if (!res.ok) return result;
    const body = await res.json();
    licensed = (body.books ?? []) as LicensedBook[];
  } catch {
    return result; // offline — leave the device untouched
  }

  const licensedById = new Map(licensed.map((b) => [b.downloadId, b]));
  const local = await readIndex();

  // Drop anything the server no longer licenses for this device.
  for (const book of local) {
    if (!licensedById.has(book.downloadId)) {
      await removeBookLocal(book.downloadId);
      result.dropped += 1;
    }
  }

  // Restore licensed books whose encrypted file is missing locally.
  for (const entry of licensed) {
    if (await fileExists(entry.downloadId)) continue;

    if (!entry.available) {
      result.unavailable += 1;
      continue;
    }

    try {
      const res = await fetch(
        `/api/customer/downloads/${entry.downloadId}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId }),
        }
      );

      if (res.ok) {
        await persistDownloadResponse(res, entry.bookId);
        result.restored += 1;
      } else if (res.status === 409) {
        result.unavailable += 1;
      }
    } catch {
      /* network dropped mid-reconcile — try again next time */
    }
  }

  return result;
}
