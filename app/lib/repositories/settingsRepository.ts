import "server-only";

import { db } from "../db/db";

export class SettingsRepository {
  static async getSettings() {
    const { rows } = await db.query(
      `SELECT * FROM settings WHERE id = 1`
    );

    return rows[0] ?? null;
  }

  static async updateSettings(data: {
    store_name: string;
    contact_email?: string | null;
    contact_phone?: string | null;
    address?: string | null;
    gst_number?: string | null;
  }) {
    const { rows } = await db.query(
      `
      UPDATE settings
      SET
        store_name = $1,
        contact_email = $2,
        contact_phone = $3,
        address = $4,
        gst_number = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
      RETURNING *
      `,
      [
        data.store_name,
        data.contact_email ?? null,
        data.contact_phone ?? null,
        data.address ?? null,
        data.gst_number ?? null,
      ]
    );

    return rows[0] ?? null;
  }
}
