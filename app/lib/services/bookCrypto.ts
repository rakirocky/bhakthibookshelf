import "server-only";

import crypto from "crypto";

/**
 * Per-download encryption for offline book files.
 *
 * Each download gets a fresh random AES-256-GCM key. The ciphertext is
 * written to the device's app-private storage; the key + iv + auth tag go
 * into the platform keystore (iOS Keychain / Android Keystore). Neither
 * half is useful without the other, and the key never touches disk as a
 * plain file.
 */

export interface EncryptedBook {
  ciphertext: Buffer;
  key: Buffer; // 32 bytes
  iv: Buffer; // 12 bytes
  authTag: Buffer; // 16 bytes
}

export function encryptBook(plaintext: Buffer): EncryptedBook {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);

  return {
    ciphertext,
    key,
    iv,
    authTag: cipher.getAuthTag(),
  };
}
