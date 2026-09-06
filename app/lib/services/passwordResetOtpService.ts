import bcrypt from "bcryptjs";
import crypto from "crypto";

import { CustomerRepository } from "../repositories/customerRepository";
import { PasswordResetOtpRepository } from "../repositories/passwordResetOtpRepository";
import { LoginRateLimitService, LoginScope } from "./loginRateLimitService";
import { sendEmail } from "./emailService";

const OTP_EXPIRY_MINUTES = 10;
const RESET_SCOPE: LoginScope = "password-reset";

function generateOtp(): string {
  // crypto.randomInt is cryptographically secure — Math.random is
  // predictable and must never be used for anything security-relevant,
  // even something as small-looking as a 6-digit code.
  return crypto.randomInt(100000, 999999).toString();
}

export class PasswordResetOtpService {
  /**
   * Step 1: customer enters their phone number. Always returns a
   * generic success message regardless of whether the phone is
   * actually registered — never reveals which phone numbers have
   * accounts, same principle as the login endpoints.
   */
  static async requestReset(phone: string) {
    const customer = await CustomerRepository.getByPhone(
      phone
    );

    if (!customer || !customer.is_active || !customer.email) {
      // No account, inactive, or no email on file to send to.
      // Silently do nothing — the generic response covers this.
      console.log(
        `[password-reset-otp] request for phone ${phone} — no eligible account, not sending anything`
      );
      return;
    }

    await PasswordResetOtpRepository.invalidateAllForCustomer(
      customer.id
    );

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60000
    );

    await PasswordResetOtpRepository.create(
      customer.id,
      otpHash,
      expiresAt
    );

    const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #d97706;">Bhakthi Bookshelf</h2>
        <p>Hi ${customer.name ?? ""},</p>
        <p>Use this code to reset your password:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b1b3b;">
          ${otp}
        </p>
        <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't change unless this code is used.</p>
      </div>
    `;

    await sendEmail({
      to: customer.email,
      subject: "Your Bhakthi Bookshelf password reset code",
      html,
    });

    console.log(
      `[password-reset-otp] sent to customer #${customer.id} (${customer.email})`
    );
  }

  /**
   * Step 2: customer submits the code plus their new password.
   */
  static async verifyAndReset(
    phone: string,
    otp: string,
    newPassword: string
  ) {
    const lockout = await LoginRateLimitService.checkLockout(
      phone,
      RESET_SCOPE
    );

    if (lockout.locked) {
      throw new Error(
        `Too many attempts. Try again in ${lockout.retryAfterMinutes} minute${lockout.retryAfterMinutes === 1 ? "" : "s"}.`
      );
    }

    const customer = await CustomerRepository.getByPhone(
      phone
    );

    const genericError = new Error(
      "Invalid or expired code."
    );

    if (!customer || !customer.is_active) {
      await LoginRateLimitService.recordFailure(
        phone,
        RESET_SCOPE
      );
      throw genericError;
    }

    const record =
      await PasswordResetOtpRepository.getLatestValid(
        customer.id
      );

    if (!record) {
      await LoginRateLimitService.recordFailure(
        phone,
        RESET_SCOPE
      );
      throw genericError;
    }

    const otpMatches = await bcrypt.compare(
      otp,
      record.otp_hash
    );

    if (!otpMatches) {
      await LoginRateLimitService.recordFailure(
        phone,
        RESET_SCOPE
      );
      throw genericError;
    }

    if (newPassword.length < 6) {
      throw new Error(
        "Password must be at least 6 characters."
      );
    }

    await LoginRateLimitService.recordSuccess(
      phone,
      RESET_SCOPE
    );

    await PasswordResetOtpRepository.markConsumed(
      record.id
    );

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await CustomerRepository.updatePassword(
      customer.id,
      newPasswordHash
    );

    console.log(
      `[password-reset-otp] password reset for customer #${customer.id}`
    );

    return customer;
  }
}
