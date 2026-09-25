import Link from "next/link";
import { getT } from "../../lib/i18n/server";

type Props = {
  title: string;
};

export default async function Breadcrumb({
  title,
}: Props) {
  const t = await getT();

  return (
    <nav
      style={{
        marginBottom: 30,
        fontSize: 15,
      }}
    >
      <Link href="/">{t("crumb.home")}</Link>

      {" / "}

      <Link href="/books">
        {t("crumb.books")}
      </Link>

      {" / "}

      <strong>{title}</strong>
    </nav>
  );
}
