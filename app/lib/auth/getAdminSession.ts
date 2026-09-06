import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  AdminSessionPayload,
  verifyAdminSession,
} from "./session";

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSession(token);
}
