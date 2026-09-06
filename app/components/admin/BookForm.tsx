"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useToast } from "@/app/context/ToastContext";

import FileUpload from "./FileUpload";
import Spinner from "../ui/Spinner";

interface BookFormValues {
  slug: string;
  title: string;
  author: string;
  description: string;
  price: string;
  cover_image: string;
  sample_pdf: string;
  full_pdf: string;
  featured: boolean;
  published: boolean;
  language: string;
}

interface BookFormProps {
  mode: "add" | "edit";
  bookId?: number;
  initialValues?: Partial<BookFormValues>;
}

const emptyForm: BookFormValues = {
  slug: "",
  title: "",
  author: "",
  description: "",
  price: "",
  cover_image: "",
  sample_pdf: "",
  full_pdf: "",
  featured: false,
  published: true,
  language: "English",
};

export default function BookForm({
  mode,
  bookId,
  initialValues,
}: BookFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<BookFormValues>({
    ...emptyForm,
    ...initialValues,
  });

  function update(
    key: keyof BookFormValues,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const url =
        mode === "add"
          ? "/api/admin/books"
          : `/api/admin/books/${bookId}`;

      const method = mode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save book");
      }

      showToast(
        mode === "add"
          ? "Book added successfully."
          : "Book updated successfully."
      );

      router.push("/admin/books");

      router.refresh();
    } catch (error) {
      console.error(error);

      showToast("Unable to save book.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label>Title</label>

          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Author</label>

          <input
            required
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Description</label>

          <textarea
            rows={5}
            value={form.description}
            onChange={(e) =>
              update("description", e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Price</label>

          <input
            type="number"
            required
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Language</label>

          <select
            value={form.language}
            onChange={(e) =>
              update("language", e.target.value)
            }
            style={inputStyle}
          >
            <option value="English">English</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <FileUpload
            label="Cover Image"
            accept="image/jpeg,image/png,image/webp"
            uploadUrl="/api/admin/upload/image"
            value={form.cover_image}
            onUploaded={(relativePath) =>
              update("cover_image", relativePath)
            }
            previewType="image"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <FileUpload
            label="Sample PDF"
            accept="application/pdf"
            uploadUrl="/api/admin/upload/pdf"
            extraField={{ name: "type", value: "sample" }}
            value={form.sample_pdf}
            onUploaded={(relativePath) =>
              update("sample_pdf", relativePath)
            }
            previewType="pdf"
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <FileUpload
            label="Full Book PDF"
            accept="application/pdf"
            uploadUrl="/api/admin/upload/pdf"
            extraField={{ name: "type", value: "ebook" }}
            value={form.full_pdf}
            onUploaded={(relativePath) =>
              update("full_pdf", relativePath)
            }
            previewType="pdf"
          />
        </div>

        <div
          style={{
            marginBottom: 20,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                update("featured", e.target.checked)
              }
            />

            {" "}Featured
          </label>
        </div>

        <div
          style={{
            marginBottom: 30,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                update("published", e.target.checked)
              }
            />

            {" "}Published
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-white)",
            border: "none",
            padding: "12px 22px",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {loading && <Spinner />}
          {loading
            ? "Saving..."
            : mode === "add"
            ? "Save Book"
            : "Update Book"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  border: "1px solid var(--color-border-input)",
  borderRadius: "6px",
} as const;
