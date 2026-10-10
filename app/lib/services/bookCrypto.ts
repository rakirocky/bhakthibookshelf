import "server-only";

import crypto from "crypto";
import fs from "fs";

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

/** Same wire result as EncryptedBook, but the ciphertext is streamed. */
export interface StreamedEncryptedBook {
  stream: ReadableStream<Uint8Array>;
  size: number; // GCM ciphertext is exactly as long as the book
  key: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

const CHUNK = 1024 * 1024;

async function* encryptFileChunks(
  filePath: string,
  key: Buffer,
  iv: Buffer
): AsyncGenerator<Buffer, Buffer> {
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  for await (const chunk of fs.createReadStream(filePath, { highWaterMark: CHUNK })) {
    yield cipher.update(chunk as Buffer);
  }
  const tail = cipher.final();
  if (tail.length) yield tail;
  return cipher.getAuthTag();
}

/**
 * Encrypts a book file for one download while holding only ~1 MB of it in
 * memory, instead of the whole book (books are up to ~100 MB; buffering
 * them made ~8 simultaneous downloads exhaust the server's RAM — measured
 * +1 GB in one process, 2026-10-10).
 *
 * The wire format is unchanged: the auth tag still goes in a response
 * header, which is sent before the body. GCM only yields the tag after the
 * last byte, so this makes two passes with the same key + iv — the first
 * just to compute the tag (output discarded), the second streamed to the
 * client. Same key, iv and bytes give the identical ciphertext, so this is
 * not nonce reuse across different messages. If the file changed between
 * passes the tags differ and the stream errors (the app would reject a
 * mismatched book anyway).
 */
export async function encryptBookFileStream(
  filePath: string
): Promise<StreamedEncryptedBook> {
  const { size } = await fs.promises.stat(filePath);
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  // pass 1: tag only
  const counting = encryptFileChunks(filePath, key, iv);
  let step = await counting.next();
  while (!step.done) step = await counting.next();
  const authTag = step.value;

  // pass 2: streamed to the client on demand (pull = backpressure)
  const chunks = encryptFileChunks(filePath, key, iv);
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await chunks.next();
        if (!next.done) {
          controller.enqueue(new Uint8Array(next.value.buffer, next.value.byteOffset, next.value.byteLength));
          return;
        }
        if (!next.value.equals(authTag)) {
          controller.error(new Error("Book file changed during download."));
          return;
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    async cancel() {
      // client went away — closes the file
      await chunks.return(Buffer.alloc(0));
    },
  });

  return { stream, size, key, iv, authTag };
}

export function encryptBook(plaintext: Buffer): EncryptedBook {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  // GCM is a stream mode: final() returns nothing, so update()'s output is
  // the whole ciphertext. Skipping Buffer.concat avoids a third copy of a
  // ~100 MB book in memory per download.
  const body = cipher.update(plaintext);
  const tail = cipher.final();
  const ciphertext = tail.length ? Buffer.concat([body, tail]) : body;

  return {
    ciphertext,
    key,
    iv,
    authTag: cipher.getAuthTag(),
  };
}

// At most this many books are read + encrypted at once per server process
// (each holds ~2x the book size in memory, books are up to ~100 MB, and the
// box has 3.7 GB for 2 app processes + Postgres). Each job takes about a
// second, so a burst of downloads waits briefly instead of exhausting RAM.
const MAX_CONCURRENT_ENCRYPTIONS = 2;
let running = 0;
const waiting: (() => void)[] = [];

export async function withEncryptionSlot<T>(job: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT_ENCRYPTIONS) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  } else {
    running++;
  }
  try {
    return await job();
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running--;
  }
}
