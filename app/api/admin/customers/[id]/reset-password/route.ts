import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { CustomerRepository } from "@/app/lib/repositories/customerRepository";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const { newPassword } = await request.json();

    if (!newPassword || String(newPassword).length < 8) {
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
      Number(id)
    );

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await CustomerRepository.updatePassword(
      customer.id,
      newHash
    );

    console.log(
      "[admin-reset-customer-password] reset for:",
      customer.phone
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset password.",
      },
      { status: 500 }
    );
  }
}
