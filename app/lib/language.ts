import "server-only";

import { cookies } from "next/headers";

export const LANGUAGE_COOKIE = "site_language";

export async function getLanguagePreference(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore.get(LANGUAGE_COOKIE)?.value ?? "all";
}
