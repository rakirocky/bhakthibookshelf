import "server-only";

import { cache } from "react";

import { getLanguagePreference } from "../language";
import { SettingsService } from "../services/settingsService";
import { I18nKey, UiLang, translate, uiLangFor } from "./dictionary";

/**
 * Interface language for this request. The navbar ಕನ್ನಡ choice always
 * filters books; it only translates the interface when the admin has
 * switched "Translate website into Kannada" on (off by default — owner
 * decision 2026-09-25). cache(): one settings read per request, however
 * many components call getT().
 */
export const getUiLang = cache(async (): Promise<UiLang> => {
  if (!(await SettingsService.isKannadaUiEnabled())) {
    return "en";
  }
  return uiLangFor(await getLanguagePreference());
});

/** Server-component translator: const t = await getT(); t("nav.home") */
export async function getT() {
  const lang = await getUiLang();
  return (key: I18nKey, vars?: Record<string, string | number>) =>
    translate(lang, key, vars);
}
