import "server-only";

import { db } from "../db/db";

export interface CustomerDeviceRow {
  id: number;
  customer_id: number;
  device_id: string;
  platform: string;
  label: string | null;
  first_seen: string;
  last_seen: string;
  revoked_at: string | null;
}

export interface BookDownloadRow {
  id: number;
  customer_id: number;
  book_id: number;
  customer_device_id: number;
  licensed_at: string;
  revoked_at: string | null;
}

export class DownloadRepository {
  /* ---------- devices ---------- */

  static async getDevice(
    customerId: number,
    deviceId: string
  ): Promise<CustomerDeviceRow | null> {
    const { rows } = await db.query(
      `
      SELECT id, customer_id, device_id, platform, label,
             first_seen, last_seen, revoked_at
      FROM customer_devices
      WHERE customer_id = $1 AND device_id = $2
      `,
      [customerId, deviceId]
    );

    return rows[0] ?? null;
  }

  static async listDevices(
    customerId: number
  ): Promise<CustomerDeviceRow[]> {
    const { rows } = await db.query(
      `
      SELECT id, customer_id, device_id, platform, label,
             first_seen, last_seen, revoked_at
      FROM customer_devices
      WHERE customer_id = $1
      ORDER BY first_seen ASC
      `,
      [customerId]
    );

    return rows;
  }

  static async countActiveDevices(
    customerId: number
  ): Promise<number> {
    const { rows } = await db.query(
      `
      SELECT COUNT(*)::int AS n
      FROM customer_devices
      WHERE customer_id = $1 AND revoked_at IS NULL
      `,
      [customerId]
    );

    return rows[0]?.n ?? 0;
  }

  /**
   * Register a device, or update its label / last_seen if it already
   * exists. Re-registering a previously revoked device un-revokes it —
   * the cap check in the service runs first, so this only lands when
   * there is room.
   */
  static async upsertDevice(data: {
    customerId: number;
    deviceId: string;
    platform: string;
    label: string | null;
  }): Promise<CustomerDeviceRow> {
    const { rows } = await db.query(
      `
      INSERT INTO customer_devices
        (customer_id, device_id, platform, label)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (customer_id, device_id) DO UPDATE SET
        label = COALESCE(EXCLUDED.label, customer_devices.label),
        platform = EXCLUDED.platform,
        last_seen = CURRENT_TIMESTAMP,
        revoked_at = NULL
      RETURNING id, customer_id, device_id, platform, label,
                first_seen, last_seen, revoked_at
      `,
      [data.customerId, data.deviceId, data.platform, data.label]
    );

    return rows[0];
  }

  static async touchDevice(id: number): Promise<void> {
    await db.query(
      `UPDATE customer_devices SET last_seen = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  static async revokeDevice(
    customerId: number,
    id: number
  ): Promise<boolean> {
    const { rowCount } = await db.query(
      `
      UPDATE customer_devices
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND customer_id = $2 AND revoked_at IS NULL
      `,
      [id, customerId]
    );

    return (rowCount ?? 0) > 0;
  }

  /* ---------- downloads ---------- */

  /**
   * Idempotent: a re-download (e.g. after a re-install) returns the
   * existing row instead of failing, and clears a prior revoke.
   */
  static async recordDownload(data: {
    customerId: number;
    bookId: number;
    customerDeviceId: number;
  }): Promise<BookDownloadRow> {
    const { rows } = await db.query(
      `
      INSERT INTO book_downloads
        (customer_id, book_id, customer_device_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (customer_device_id, book_id) DO UPDATE SET
        licensed_at = CURRENT_TIMESTAMP,
        revoked_at = NULL
      RETURNING id, customer_id, book_id, customer_device_id,
                licensed_at, revoked_at
      `,
      [data.customerId, data.bookId, data.customerDeviceId]
    );

    return rows[0];
  }

  static async listDownloadsForDevice(
    customerDeviceId: number
  ): Promise<
    (BookDownloadRow & {
      title: string;
      slug: string;
      author: string;
      cover_image: string | null;
    })[]
  > {
    const { rows } = await db.query(
      `
      SELECT d.id, d.customer_id, d.book_id, d.customer_device_id,
             d.licensed_at, d.revoked_at,
             b.title, b.slug, b.author, b.cover_image
      FROM book_downloads d
      JOIN books b ON b.id = d.book_id
      WHERE d.customer_device_id = $1 AND d.revoked_at IS NULL
      ORDER BY d.licensed_at DESC
      `,
      [customerDeviceId]
    );

    return rows;
  }

  static async getDownload(
    customerId: number,
    id: number
  ): Promise<BookDownloadRow | null> {
    const { rows } = await db.query(
      `
      SELECT id, customer_id, book_id, customer_device_id,
             licensed_at, revoked_at
      FROM book_downloads
      WHERE id = $1 AND customer_id = $2
      `,
      [id, customerId]
    );

    return rows[0] ?? null;
  }

  static async revokeDownload(
    customerId: number,
    id: number
  ): Promise<boolean> {
    const { rowCount } = await db.query(
      `
      UPDATE book_downloads
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND customer_id = $2 AND revoked_at IS NULL
      `,
      [id, customerId]
    );

    return (rowCount ?? 0) > 0;
  }
}
