"use client";

import { Book } from "@/app/lib/types/book";
import { useCart } from "@/app/hooks/useCart";

type Props = {
  book: Book;
};

export default function AddToCartButton({
  book,
}: Props) {
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
      Add To Cart
    </button>
  );
}
