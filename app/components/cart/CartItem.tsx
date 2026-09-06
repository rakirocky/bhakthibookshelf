"use client";

import Image from "next/image";

import { CartItem as Item } from "@/app/context/CartContext";
import { useCart } from "@/app/hooks/useCart";
import { fileUrl } from "@/app/lib/upload/fileUrl";

type Props = {
  item: Item;
};

export default function CartItem({
  item,
}: Props) {
  const {
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <div
      className="cart-item"
      style={{
        display: "flex",
        gap: 24,
        padding: "20px 0",
        borderBottom: "1px solid var(--color-border-strong)",
        flexWrap: "wrap",
      }}
    >
      <Image
        src={
          fileUrl(item.cover) ||
          "/images/books/default-book.jpg"
        }
        alt={item.title}
        width={120}
        height={170}
      />

      <div style={{ flex: 1, minWidth: 200 }}>
        <h3>{item.title}</h3>

        <p>{item.author}</p>

        <h2>
          ₹{item.price}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 15,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="qty-btn"
            onClick={() =>
              updateQuantity(
                item.id,
                item.quantity - 1
              )
            }
          >
            -
          </button>

          <strong>
            {item.quantity}
          </strong>

          <button
            type="button"
            className="qty-btn"
            onClick={() =>
              updateQuantity(
                item.id,
                item.quantity + 1
              )
            }
          >
            +
          </button>

          <button
            type="button"
            className="btn-danger-text"
            onClick={() =>
              removeItem(item.id)
            }
          >
            Remove
          </button>
        </div>
      </div>

      <div>

        <h2>
          ₹
          {item.price *
            item.quantity}
        </h2>

      </div>
    </div>
  );
}
