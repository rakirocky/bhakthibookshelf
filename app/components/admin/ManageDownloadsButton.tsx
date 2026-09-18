"use client";

import { useState } from "react";

import { useToast } from "@/app/context/ToastContext";
import Spinner from "../ui/Spinner";

interface DownloadRow {
  downloadId: number;
  title: string;
  device: {
    id: number;
    label: string | null;
    platform: string;
  };
  revoked: boolean;
}

export default function ManageDownloadsButton({
  customerId,
}: {
  customerId: number;
}) {
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(
    null
  );
  const [downloads, setDownloads] = useState<
    DownloadRow[] | null
  >(null);

  async function loadDownloads() {
    setOpen(true);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/downloads`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to load downloads."
        );
      }

      setDownloads(data.downloads);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to load downloads.",
        "error"
      );

      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(downloadId: number) {
    setRevokingId(downloadId);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/downloads?downloadId=${downloadId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ?? "Unable to revoke download."
        );
      }

      showToast("Download revoked.");

      setDownloads(
        (prev) =>
          prev?.map((d) =>
            d.downloadId === downloadId
              ? { ...d, revoked: true }
              : d
          ) ?? null
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to revoke download.",
        "error"
      );
    } finally {
      setRevokingId(null);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={loadDownloads}
        className="btn btn-outline"
        style={{
          padding: "6px 12px",
          fontSize: 13,
        }}
      >
        Downloads
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-start",
        minWidth: 220,
        textAlign: "left",
      }}
    >
      {loading && <Spinner />}

      {!loading && downloads?.length === 0 && (
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
          }}
        >
          No downloads on any device.
        </span>
      )}

      {!loading &&
        downloads?.map((d) => (
          <div
            key={d.downloadId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
            }}
          >
            <span>
              {d.title}
              <span
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                {" "}
                — {d.device.label || d.device.platform}
              </span>
            </span>

            {d.revoked ? (
              <span
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                Revoked
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleRevoke(d.downloadId)
                }
                disabled={revokingId === d.downloadId}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-danger-text)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Revoke
              </button>
            )}
          </div>
        ))}

      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setDownloads(null);
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-text-secondary)",
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
        }}
      >
        Close
      </button>
    </div>
  );
}
