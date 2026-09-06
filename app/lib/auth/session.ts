import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Set a long random " +
        "value in .env.local (see CHANGES.md)."
    );
  }

  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  adminId: number;
  phone: string;
  name: string | null;
}

export async function signAdminSession(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    )
    .sign(getSecretKey());
}

export async function verifyAdminSession(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      adminId: payload.adminId as number,
      phone: payload.phone as string,
      name: (payload.name as string) ?? null,
    };
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
