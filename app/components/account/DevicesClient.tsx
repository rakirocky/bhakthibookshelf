"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrCreateDeviceId } from "@/app/lib/offline/device";
import { useIsNativeApp } from "@/app/lib/offline/useNative";
import { useToast } from "@/app/context/ToastContext";

// Mirror of MAX_DEVICES_PER_ACCOUNT in app/lib/services/downloadService.ts —
// the server is the source of truth; this is just for the "N of 3" hint.
const MAX_DEVICES = 3;

interface Device {
  id: number;
  deviceId: string;
  label: string | null;
  platform: string;
  addedAt: string;
  lastSeen: string;
  revoked: boolean;
  bookCount: number;
}

function fmtDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export default function DevicesClient() {
  const native = useIsNativeApp();
  const { showToast } = useToast();

  const [devices, setDevices] = useState<Device[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thisDeviceId, setThisDeviceId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;

    fetch("/api/customer/devices")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message ?? "Could not load your devices.");
        }
        return body.devices as Device[];
      })
      .then((list) => {
        if (!alive) return;
        setDevices(list);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setDevices([]);
        setError(
          err instanceof Error
            ? err.message
            : "Could not load your devices."
        );
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!native) return;
    getOrCreateDeviceId()
      .then((id) => setThisDeviceId(id))
      .catch(() => setThisDeviceId(null));
  }, [native]);

  async function deauthorize(device: Device) {
    const isThis = device.deviceId === thisDeviceId;
    const confirmed = window.confirm(
      `Remove "${device.label ?? "this device"}"?\n\n` +
        "It frees a slot so you can set up downloads on another device. " +
        "Books already saved on it keep working offline" +
        (isThis
          ? " — including on this one, until you remove them here."
          : ".")
    );

    if (!confirmed) return;

    setBusyId(device.id);

    try {
      const res = await fetch(`/api/customer/devices/${device.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Could not remove the device.");
      }

      showToast("Device removed.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not remove the device.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  }

  const active = (devices ?? []).filter((d) => !d.revoked);

  return (
    <div>
      <Link
        href="/account"
        style={{ fontSize: 14, color: "var(--color-text-secondary)" }}
      >
        ← Back to My Account
      </Link>

      <h1 style={{ marginTop: 16, marginBottom: 6 }}>Manage devices</h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        Downloads are tied to the device they were saved on. You can keep
        them on up to {MAX_DEVICES} devices at a time. Removing a device
        frees a slot; books already saved on it stay readable offline.
      </p>

      <div
        style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 4,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Your devices</h2>
          {devices !== null && (
            <span
              style={{ fontSize: 13, color: "var(--color-text-muted)" }}
            >
              {active.length} of {MAX_DEVICES} in use
            </span>
          )}
        </div>

        {devices === null && (
          <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
            Loading…
          </p>
        )}

        {error && (
          <p
            style={{
              color: "var(--color-danger-text)",
              fontSize: 14,
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        )}

        {devices !== null && !error && active.length === 0 && (
          <p
            style={{
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: 0,
            }}
          >
            No devices yet. Open the Bhakthi Bookshelf app on a phone or
            tablet and save a book for offline reading — the device is
            registered automatically.
          </p>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {active.map((device) => {
            const isThis = device.deviceId === thisDeviceId;

            return (
              <li
                key={device.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 0",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    {device.label ?? "Unnamed device"}
                    {isThis && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-primary)",
                          borderRadius: 10,
                          padding: "1px 7px",
                        }}
                      >
                        This device
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {device.platform} · {device.bookCount}{" "}
                    {device.bookCount === 1 ? "book" : "books"} · added{" "}
                    {fmtDate(device.addedAt)} · last used{" "}
                    {fmtDate(device.lastSeen)}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-danger-text"
                  disabled={busyId === device.id}
                  onClick={() => deauthorize(device)}
                >
                  {busyId === device.id ? "Removing…" : "Deauthorize"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
