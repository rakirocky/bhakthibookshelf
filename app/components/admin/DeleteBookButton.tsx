"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import Spinner from "../ui/Spinner";

export default function DeleteBookButton({
  bookId,
}: {
  bookId: number;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/books/${bookId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      showToast("Book deleted successfully.");

      router.push("/admin/books");

      router.refresh();
    } catch (error) {
      console.error(error);

      showToast("Unable to delete book.", "error");

      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        style={{
          background: "var(--color-danger-text)",
          color: "var(--color-white)",
          border: "none",
          padding: "12px 22px",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {loading && <Spinner />}
        {loading ? "Deleting..." : "Yes, Delete Book"}
      </button>

      <button
        type="button"
        onClick={() => router.push("/admin/books")}
        disabled={loading}
        style={{
          background: "var(--color-white)",
          color: "var(--color-text-strong)",
          border: "1px solid var(--color-border-input)",
          padding: "12px 22px",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
