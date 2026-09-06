import "server-only";

import { db } from "../db/db";

export class PasswordResetOtpRepository {
  static async invalidateAllForCustomer(customerId: number) {
    // Requesting a new code makes any previous one immediately
    // unusable — only ever one valid code per customer at a time,
    // avoiding confusion about which code is the "real" one.
    await db.query(
      `
      UPDATE password_reset_otps
      SET consumed_at = CURRENT_TIMESTAMP
      WHERE customer_id = $1 AND consumed_at IS NULL
      `,
      [customerId]
    );
  }

  static async create(
    customerId: number,
    otpHash: string,
    expiresAt: Date
  ) {
    const { rows } = await db.query(
      `
      INSERT INTO password_reset_otps (customer_id, otp_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [customerId, otpHash, expiresAt]
    );

    return rows[0];
  }

  static async getLatestValid(customerId: number) {
    const { rows } = await db.query(
      `
      SELECT id, otp_hash, expires_at
      FROM password_reset_otps
      WHERE customer_id = $1
        AND consumed_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [customerId]
    );

    return rows[0] ?? null;
  }

  static async markConsumed(id: number) {
    await db.query(
      `UPDATE password_reset_otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }
}
