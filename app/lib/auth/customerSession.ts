import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "customer_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.CUSTOMER_SESSION_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "CUSTOMER_SESSION_SECRET is missing or too short. Set a long " +
        "random value in .env.local (see CHANGES.md)."
    );
  }

  return new TextEncoder().encode(secret);
}

export interface CustomerSessionPayload {
  customerId: number;
  phone: string;
  name: string | null;
}

export async function signCustomerSession(
  payload: CustomerSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    )
    .sign(getSecretKey());
}

export async function verifyCustomerSession(
  token: string
): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      customerId: payload.customerId as number,
      phone: payload.phone as string,
      name: (payload.name as string) ?? null,
    };
  } catch {
    return null;
  }
}

export const CUSTOMER_SESSION_COOKIE = COOKIE_NAME;
export const CUSTOMER_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
