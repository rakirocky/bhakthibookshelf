"use client";

import { ChangeEvent, useRef, useState } from "react";

import { fileUrl } from "@/app/lib/upload/fileUrl";

import Spinner from "../ui/Spinner";

interface FileUploadProps {
  label: string;
  accept: string;
  uploadUrl: string;
  value: string;
  onUploaded: (relativePath: string) => void;
  previewType?: "image" | "pdf" | "none";
  /** Extra form field sent alongside the file, e.g. { type: "sample" } */
  extraField?: {
    name: string;
    value: string;
  };
}

export default function FileUpload({
  label,
  accept,
  uploadUrl,
  value,
  onUploaded,
  previewType = "none",
  extraField,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      if (extraField) {
        formData.append(extraField.name, extraField.value);
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Upload failed.");
      }

      onUploaded(data.relativePath);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </label>

      {previewType === "image" && value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl(value)}
          alt={label}
          style={{
            width: 120,
            height: 160,
            objectFit: "cover",
            borderRadius: 6,
            marginBottom: 10,
            border: "1px solid var(--color-border)",
            display: "block",
          }}
        />
      )}

      {previewType === "pdf" && value && (
        <div
          style={{
            marginBottom: 10,
            fontSize: 14,
            color: "var(--color-text-strong)",
          }}
        >
          📄{" "}
          <a
            href={fileUrl(value)}
            target="_blank"
            rel="noreferrer"
          >
            View current file
          </a>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
            padding: "8px 16px",
            borderRadius: 6,
            cursor: uploading ? "not-allowed" : "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {uploading && <Spinner variant="dark" />}
          {uploading
            ? "Uploading..."
            : value
            ? "Replace File"
            : "Choose File"}
        </button>

        {value && !uploading && !error && (
          <span
            style={{
              fontSize: 13,
              color: "var(--color-success-text)",
            }}
          >
            ✓ Uploaded
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {error && (
        <p
          style={{
            color: "var(--color-danger-text)",
            fontSize: 13,
            marginTop: 6,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
