"use client";

import Container from "../ui/Container";
import { useT } from "@/app/lib/i18n/I18nProvider";

export default function LibraryHeader() {
  const { t } = useT();
  return (
    <section className="library-header">
      <Container>
        <h1>{t("library.title")}</h1>

        <p>{t("library.subtitle")}</p>
      </Container>
    </section>
  );
}
