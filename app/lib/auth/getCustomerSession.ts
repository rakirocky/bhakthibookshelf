import "server-only";

import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE,
  CustomerSessionPayload,
  verifyCustomerSession,
} from "./customerSession";

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    CUSTOMER_SESSION_COOKIE
  )?.value;

  if (!token) {
    return null;
  }

  return verifyCustomerSession(token);
}
