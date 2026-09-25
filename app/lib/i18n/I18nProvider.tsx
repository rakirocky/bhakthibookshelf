"use client";

import { createContext, useCallback, useContext } from "react";

import { I18nKey, UiLang, translate } from "./dictionary";

const LangContext = createContext<UiLang>("en");

/** Set once in the root layout from the site_language cookie. */
export function I18nProvider({
  lang,
  children,
}: {
  lang: UiLang;
  children: React.ReactNode;
}) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Client-component translator: const { t, lang } = useT(); */
export function useT() {
  const lang = useContext(LangContext);
  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );
  return { t, lang };
}
