import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } =
      await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Current and new password are both required.",
        },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const customer = await CustomerRepository.getById(
      session.customerId
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    const currentMatches = await bcrypt.compare(
      currentPassword,
      customer.password_hash
    );

    if (!currentMatches) {
      console.log(
        "[customer-change-password] wrong current password:",
        customer.phone
      );

      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await CustomerRepository.updatePassword(
      customer.id,
      newHash
    );

    console.log(
      "[customer-change-password] password changed:",
      customer.phone
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to change password.",
      },
      { status: 500 }
    );
  }
}
