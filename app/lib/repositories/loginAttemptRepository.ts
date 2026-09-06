import "server-only";

import { db } from "../db/db";

export class LoginAttemptRepository {
  static async get(identifier: string, scope: string) {
    const { rows } = await db.query(
      `
      SELECT identifier, scope, failed_count, locked_until
      FROM login_attempts
      WHERE identifier = $1 AND scope = $2
      `,
      [identifier, scope]
    );

    return rows[0] ?? null;
  }

  static async recordFailure(
    identifier: string,
    scope: string,
    lockoutUntil: Date | null
  ) {
    await db.query(
      `
      INSERT INTO login_attempts (identifier, scope, failed_count, locked_until, updated_at)
      VALUES ($1, $2, 1, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (identifier, scope)
      DO UPDATE SET
        failed_count = login_attempts.failed_count + 1,
        locked_until = $3,
        updated_at = CURRENT_TIMESTAMP
      `,
      [identifier, scope, lockoutUntil]
    );
  }

  static async clear(identifier: string, scope: string) {
    await db.query(
      `DELETE FROM login_attempts WHERE identifier = $1 AND scope = $2`,
      [identifier, scope]
    );
  }
}
