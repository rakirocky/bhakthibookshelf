"use client";

import { Book } from "@/app/lib/types/book";
import { useCart } from "@/app/hooks/useCart";
import { useT } from "@/app/lib/i18n/I18nProvider";

type Props = {
  book: Book;
};

export default function AddToCartButton({
  book,
}: Props) {
  const { t } = useT();
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({
      id: book.id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      cover: book.cover_image,
      price: Number(
        book.discount_price ?? book.price
      ),
    });
  }

  return (
    <button
      className="buy-button"
      onClick={handleAddToCart}
    >
      {t("book.addToCart")}
    </button>
  );
}
