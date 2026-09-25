import "server-only";

import { getLanguagePreference } from "../language";
import { I18nKey, UiLang, translate, uiLangFor } from "./dictionary";

/** Interface language for this request (navbar ಕನ್ನಡ → Kannada). */
export async function getUiLang(): Promise<UiLang> {
  return uiLangFor(await getLanguagePreference());
}

/** Server-component translator: const t = await getT(); t("nav.home") */
export async function getT() {
  const lang = await getUiLang();
  return (key: I18nKey, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
}
