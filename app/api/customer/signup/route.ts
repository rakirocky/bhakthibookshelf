import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  signCustomerSession,
} from "@/app/lib/auth/customerSession";

const PHONE_REGEX = /^[6-9]\d{9}$/;

export async function POST(request: Request) {
  try {
    const { phone, password, name, email } =
      await request.json();

    const cleanPhone = String(phone ?? "").trim();

    if (!PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    if (!password || String(password).length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existing = await CustomerRepository.getByPhone(
      cleanPhone
    );

    if (existing) {
      console.log(
        `[customer signup] rejected — phone ${cleanPhone} already registered`
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this phone number already exists. Try logging in instead.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await CustomerRepository.create({
      phone: cleanPhone,
      name: name || null,
      email: email || null,
      passwordHash,
    });

    console.log(
      `[customer signup] success — customer #${customer.id} (${customer.phone})`
    );

    const token = await signCustomerSession({
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name,
    });

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: CUSTOMER_SESSION_MAX_AGE,
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Signup failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
