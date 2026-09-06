"use client";

/** base64 <-> bytes helpers that work in the WebView without Node Buffer. */

export function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/**
 * Decrypt a book downloaded from POST /api/customer/downloads.
 *
 * The server encrypts with Node's AES-256-GCM, which hands back the auth
 * tag separately; WebCrypto wants it appended to the ciphertext.
 */
export async function decryptBook(
  ciphertext: Uint8Array,
  keyB64: string,
  ivB64: string,
  tagB64: string
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToBytes(keyB64),
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const tag = base64ToBytes(tagB64);
  const combined = new Uint8Array(
    new ArrayBuffer(ciphertext.length + tag.length)
  );
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivB64), tagLength: 128 },
    key,
    combined
  );
}
