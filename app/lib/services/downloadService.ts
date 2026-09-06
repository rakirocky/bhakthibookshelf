import "server-only";

import fs from "fs/promises";
import path from "path";

import { CustomerRepository } from "../repositories/customerRepository";
import {
  CustomerDeviceRow,
  DownloadRepository,
} from "../repositories/downloadRepository";
import { AccessService } from "./accessService";
import { getBookById } from "./book-service";
import { encryptBook, EncryptedBook } from "./bookCrypto";

/**
 * Max devices that can hold downloads for one account. Removing a device
 * in "Manage devices" frees a slot; it does not disable copies already on
 * that device (see docs/downloads-drm-design.md §9).
 */
export const MAX_DEVICES_PER_ACCOUNT = 3;

const PLATFORMS = new Set(["android", "ios", "web"]);

export class DownloadError extends Error {
  status: number;
  extra?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "DownloadError";
    this.status = status;
    this.extra = extra;
  }
}

export interface DownloadPayload {
  downloadId: number;
  book: {
    id: number;
    title: string;
    slug: string;
    author: string;
  };
  encrypted: EncryptedBook;
  watermark: {
    email: string | null;
    phone: string;
  };
}

export class DownloadService {
  /* ---------- devices ---------- */

  static async registerDevice(input: {
    customerId: number;
    deviceId: string;
    platform?: string;
    label?: string | null;
  }): Promise<{ device: CustomerDeviceRow; isNew: boolean }> {
    const deviceId = (input.deviceId ?? "").trim();

    if (!/^[A-Za-z0-9_-]{8,64}$/.test(deviceId)) {
      throw new DownloadError("Invalid device id.", 400);
    }

    const platform =
      input.platform && PLATFORMS.has(input.platform)
        ? input.platform
        : "android";

    const existing = await DownloadRepository.getDevice(
      input.customerId,
      deviceId
    );

    if (existing && !existing.revoked_at) {
      await DownloadRepository.touchDevice(existing.id);
      return { device: existing, isNew: false };
    }

    // A brand-new device, or reviving a revoked one, both consume a slot.
    const activeCount = await DownloadRepository.countActiveDevices(
      input.customerId
    );

    if (activeCount >= MAX_DEVICES_PER_ACCOUNT) {
      const devices = await DownloadRepository.listDevices(
        input.customerId
      );

      throw new DownloadError(
        `You can keep downloads on ${MAX_DEVICES_PER_ACCOUNT} devices. ` +
          `Remove one to add this device.`,
        409,
        {
          reason: "device_limit",
          limit: MAX_DEVICES_PER_ACCOUNT,
          devices: devices
            .filter((d) => !d.revoked_at)
            .map(publicDevice),
        }
      );
    }

    const device = await DownloadRepository.upsertDevice({
      customerId: input.customerId,
      deviceId,
      platform,
      label: input.label?.slice(0, 120) ?? null,
    });

    return { device, isNew: true };
  }

  static async listDevices(customerId: number) {
    const devices = await DownloadRepository.listDevices(customerId);
    return devices.map(publicDevice);
  }

  static async revokeDevice(customerId: number, id: number) {
    const ok = await DownloadRepository.revokeDevice(customerId, id);

    if (!ok) {
      throw new DownloadError("Device not found.", 404);
    }
  }

  /* ---------- downloads ---------- */

  static async requestDownload(input: {
    customerId: number;
    deviceId: string;
    bookId: number;
  }): Promise<DownloadPayload> {
    const device = await DownloadRepository.getDevice(
      input.customerId,
      (input.deviceId ?? "").trim()
    );

    if (!device || device.revoked_at) {
      throw new DownloadError(
        "This device is not registered for downloads.",
        403,
        { reason: "device_not_registered" }
      );
    }

    if (!Number.isInteger(input.bookId) || input.bookId <= 0) {
      throw new DownloadError("Invalid book.", 400);
    }

    const hasAccess = await AccessService.customerHasAccessToBook(
      input.customerId,
      input.bookId
    );

    if (!hasAccess) {
      throw new DownloadError(
        "You don't have access to this book yet. Purchase it or subscribe to unlock it.",
        403,
        { reason: "no_access" }
      );
    }

    const book = await getBookById(input.bookId);

    if (!book || !book.full_pdf) {
      throw new DownloadError("Book file not available.", 404);
    }

    const plaintext = await readBookFile(book.full_pdf);
    const encrypted = encryptBook(plaintext);

    const record = await DownloadRepository.recordDownload({
      customerId: input.customerId,
      bookId: book.id,
      customerDeviceId: device.id,
    });

    await DownloadRepository.touchDevice(device.id);

    const customer = await CustomerRepository.getById(
      input.customerId
    );

    return {
      downloadId: record.id,
      book: {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
      },
      encrypted,
      watermark: {
        email: customer?.email ?? null,
        phone: customer?.phone ?? input.customerId.toString(),
      },
    };
  }

  static async listDownloads(customerId: number, deviceId: string) {
    const device = await DownloadRepository.getDevice(
      customerId,
      (deviceId ?? "").trim()
    );

    if (!device) {
      return { device: null, books: [] as unknown[] };
    }

    const rows = await DownloadRepository.listDownloadsForDevice(
      device.id
    );

    return {
      device: publicDevice(device),
      books: rows.map((r) => ({
        downloadId: r.id,
        bookId: r.book_id,
        title: r.title,
        slug: r.slug,
        author: r.author,
        licensedAt: r.licensed_at,
      })),
    };
  }

  static async removeDownload(customerId: number, id: number) {
    const ok = await DownloadRepository.revokeDownload(customerId, id);

    if (!ok) {
      throw new DownloadError("Download not found.", 404);
    }
  }
}

function publicDevice(d: CustomerDeviceRow) {
  return {
    id: d.id,
    label: d.label,
    platform: d.platform,
    addedAt: d.first_seen,
    lastSeen: d.last_seen,
    revoked: Boolean(d.revoked_at),
  };
}

/**
 * full_pdf is stored one of three ways (see app/lib/upload/fileUrl.ts):
 * an admin-uploaded relative path under storage/, an old seed path under
 * public/, or an absolute URL. Read the bytes for each.
 */
async function readBookFile(fullPdf: string): Promise<Buffer> {
  if (fullPdf.startsWith("http://") || fullPdf.startsWith("https://")) {
    const res = await fetch(fullPdf);

    if (!res.ok) {
      throw new DownloadError("Book file could not be read.", 502);
    }

    return Buffer.from(await res.arrayBuffer());
  }

  const base = fullPdf.startsWith("/")
    ? path.join(process.cwd(), "public")
    : process.cwd();

  const filePath = path.join(base, fullPdf);

  try {
    return await fs.readFile(filePath);
  } catch {
    throw new DownloadError("Book file not found on server.", 404);
  }
}
