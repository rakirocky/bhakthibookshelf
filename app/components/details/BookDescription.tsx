import { Book } from "../../lib/types/book";
import { getT } from "../../lib/i18n/server";

type Props = {
  book: Book;
};

export default async function BookDescription({
  book,
}: Props) {
  const t = await getT();

  return (
    <section className="book-description">

      <h2>{t("book.description")}</h2>

      <p>
        {book.description || t("book.descriptionSoon")}
      </p>

    </section>
  );
}
