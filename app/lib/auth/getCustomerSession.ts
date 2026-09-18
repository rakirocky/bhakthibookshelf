import "server-only";

import { cookies } from "next/headers";

import { CustomerRepository } from "../repositories/customerRepository";
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

  const payload = await verifyCustomerSession(token);

  if (!payload) {
    return null;
  }

  // Single-active-session enforcement (see migration 024): this JWT is
  // cryptographically valid, but a login is only ever accepted while
  // no other session is active, and an admin can force-clear one — so
  // confirm this is still THE session on record, not one that's been
  // superseded. proxy.ts's Edge runtime can't do this DB check (no
  // `pg` there), so it stays a coarse "well-formed token" gate and
  // this Node-runtime layer is the authoritative one — same "belt to
  // middleware's braces" split as app/account/(protected)/layout.tsx.
  const activeSessionId =
    await CustomerRepository.getActiveSessionId(
      payload.customerId
    );

  if (activeSessionId !== payload.sessionId) {
    return null;
  }

  return payload;
}
