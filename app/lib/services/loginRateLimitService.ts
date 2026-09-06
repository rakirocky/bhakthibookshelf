import { LoginAttemptRepository } from "../repositories/loginAttemptRepository";

export type LoginScope = "admin" | "customer" | "password-reset";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export class LoginRateLimitService {
  /**
   * Call this BEFORE checking the password. If locked, don't even
   * touch bcrypt — reject immediately. This is both the security
   * control (stop letting them guess) and a cheap performance win
   * (bcrypt is deliberately slow; skipping it under lockout also
   * reduces load from a sustained attack).
   */
  static async checkLockout(
    identifier: string,
    scope: LoginScope
  ): Promise<{ locked: boolean; retryAfterMinutes?: number }> {
    const record = await LoginAttemptRepository.get(
      identifier,
      scope
    );

    if (!record || !record.locked_until) {
      return { locked: false };
    }

    const lockedUntil = new Date(record.locked_until);
    const now = new Date();

    if (lockedUntil <= now) {
      return { locked: false };
    }

    const retryAfterMinutes = Math.ceil(
      (lockedUntil.getTime() - now.getTime()) / 60000
    );

    return { locked: true, retryAfterMinutes };
  }

  static async recordFailure(
    identifier: string,
    scope: LoginScope
  ) {
    const existing = await LoginAttemptRepository.get(
      identifier,
      scope
    );

    const newCount = (existing?.failed_count ?? 0) + 1;

    // Locks (or re-locks, extending the window) once the threshold is
    // reached — including if they're still failing after a previous
    // lockout already expired, so persistent guessing stays blocked
    // rather than getting a fresh full allowance every 15 minutes.
    const shouldLock = newCount >= MAX_ATTEMPTS;

    const lockoutUntil = shouldLock
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60000)
      : null;

    await LoginAttemptRepository.recordFailure(
      identifier,
      scope,
      lockoutUntil
    );

    if (shouldLock) {
      console.log(
        `[rate-limit] ${scope} login for "${identifier}" locked for ${LOCKOUT_MINUTES} minutes after ${newCount} failed attempts`
      );
    }
  }

  static async recordSuccess(
    identifier: string,
    scope: LoginScope
  ) {
    await LoginAttemptRepository.clear(identifier, scope);
  }
}
