import { NextResponse } from "next/server";

import { getCustomerSession } from "@/app/lib/auth/getCustomerSession";
import { CustomerRepository } from "@/app/lib/repositories/customerRepository";
import { MarketingContactRepository } from "@/app/lib/repositories/marketingContactRepository";

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { optIn } = await request.json();

    if (typeof optIn !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid request." },
        { status: 400 }
      );
    }

    const customer = await CustomerRepository.getById(
      session.customerId
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    // By phone, so an imported contact with the same number follows the
    // customer's own choice too.
    await MarketingContactRepository.setConsent(
      customer.phone,
      optIn ? "yes" : "no"
    );

    console.log(
      `[account] customer #${customer.id} marketing opt-${optIn ? "in" : "out"}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your preference.",
      },
      { status: 500 }
    );
  }
}
