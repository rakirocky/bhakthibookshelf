"use client";

import { isNativeApp } from "./native";

/**
 * A random per-install device id, kept in the platform keystore. It is
 * NOT derived from any hardware identifier (Play / App Store both forbid
 * that), so it resets on uninstall — which is fine: the server lets a
 * reinstalled device re-download for free.
 */

const DEVICE_ID_KEY = "bbs_device_id";

async function secureStorage() {
  const mod = await import("@aparajita/capacitor-secure-storage");
  // Wrap it: returning the bare Capacitor plugin proxy from an async
  // function makes the promise machinery read `.then` on the proxy,
  // which Capacitor turns into a native call and throws
  // ("SecureStorage.then() is not implemented on android").
  return { store: mod.SecureStorage };
}

// getOrCreateDeviceId does a read-then-write on the keystore with no lock.
// Two overlapping callers (React StrictMode double-invokes effects in dev,
// and downloadBook / reconcile can both want the id at once) would each
// see "no id" and mint a different one. Memoise the in-flight promise so
// concurrent callers in the same JS context share one resolution.
let deviceIdPromise: Promise<string> | null = null;

export function getOrCreateDeviceId(): Promise<string> {
  if (!deviceIdPromise) {
    deviceIdPromise = resolveDeviceId().catch((err) => {
      deviceIdPromise = null; // failed — let a later call retry
      throw err;
    });
  }
  return deviceIdPromise;
}

async function resolveDeviceId(): Promise<string> {
  const { store } = await secureStorage();

  const existing = (await store.get(DEVICE_ID_KEY)) as string | null;
  if (typeof existing === "string" && existing.length >= 8) {
    return existing;
  }

  const id = crypto.randomUUID().replace(/-/g, "");
  await store.set(DEVICE_ID_KEY, id);
  return id;
}

export async function getDeviceLabel(): Promise<string> {
  if (!isNativeApp()) return "This device";
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    return [info.manufacturer, info.model].filter(Boolean).join(" ") || "Android device";
  } catch {
    return "Android device";
  }
}

/* ---------- per-book key material ---------- */

interface BookKey {
  key: string;
  iv: string;
  tag: string;
}

const keyName = (downloadId: number) => `bbs_bk_${downloadId}`;

export async function saveBookKey(downloadId: number, k: BookKey): Promise<void> {
  const { store } = await secureStorage();
  await store.set(keyName(downloadId), JSON.stringify(k));
}

export async function loadBookKey(downloadId: number): Promise<BookKey | null> {
  const { store } = await secureStorage();
  const raw = (await store.get(keyName(downloadId))) as string | null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BookKey;
  } catch {
    return null;
  }
}

export async function deleteBookKey(downloadId: number): Promise<void> {
  const { store } = await secureStorage();
  try {
    await store.remove(keyName(downloadId));
  } catch {
    /* already gone */
  }
}
