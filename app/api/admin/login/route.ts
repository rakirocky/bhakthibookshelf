import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { AdminUserRepository } from "@/app/lib/repositories/adminUserRepository";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  signAdminSession,
} from "@/app/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and password are required.",
        },
        { status: 400 }
      );
    }

    const admin = await AdminUserRepository.getByPhone(
      String(phone).trim()
    );

    // Same generic message whether the phone isn't registered, the
    // account is deactivated, or the password is wrong — don't help an
    // attacker figure out which phone numbers are valid admins.
    const invalidCredentials = NextResponse.json(
      {
        success: false,
        message: "Invalid phone number or password.",
      },
      { status: 401 }
    );

    if (!admin || !admin.is_active) {
      return invalidCredentials;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return invalidCredentials;
    }

    const token = await signAdminSession({
      adminId: admin.id,
      phone: admin.phone,
      name: admin.name,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
