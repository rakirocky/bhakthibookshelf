"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrCreateDeviceId } from "@/app/lib/offline/device";
import { useIsNativeApp } from "@/app/lib/offline/useNative";
import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";

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
  const { t } = useT();
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
          throw new Error(body.message ?? t("devices.loadFailed"));
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
            : t("devices.loadFailed")
        );
      });

    return () => {
      alive = false;
    };
  }, [reloadKey, t]);

  useEffect(() => {
    if (!native) return;
    getOrCreateDeviceId()
      .then((id) => setThisDeviceId(id))
      .catch(() => setThisDeviceId(null));
  }, [native]);

  async function deauthorize(device: Device) {
    const isThis = device.deviceId === thisDeviceId;
    const confirmed = window.confirm(
      t(isThis ? "devices.confirmThis" : "devices.confirm", {
        name: device.label ?? t("devices.thisDeviceLower"),
      })
    );

    if (!confirmed) return;

    setBusyId(device.id);

    try {
      const res = await fetch(`/api/customer/devices/${device.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? t("devices.removeFailed"));
      }

      showToast(t("devices.removed"));
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("devices.removeFailed"),
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
        {t("pw.back")}
      </Link>

      <h1 style={{ marginTop: 16, marginBottom: 6 }}>{t("devices.title")}</h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        {t("devices.intro", { max: MAX_DEVICES })}
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
          <h2 style={{ margin: 0, fontSize: 18 }}>{t("devices.yours")}</h2>
          {devices !== null && (
            <span
              style={{ fontSize: 13, color: "var(--color-text-muted)" }}
            >
              {t("devices.inUse", { n: active.length, max: MAX_DEVICES })}
            </span>
          )}
        </div>

        {devices === null && (
          <p style={{ color: "var(--color-text-muted)", marginBottom: 0 }}>
            {t("downloads.loading")}
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
            {t("devices.none")}
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
                    {device.label ?? t("devices.unnamed")}
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
                        {t("devices.thisDevice")}
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
                    {t("devices.meta", { platform: device.platform, n: device.bookCount, added: fmtDate(device.addedAt), used: fmtDate(device.lastSeen) })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-danger-text"
                  disabled={busyId === device.id}
                  onClick={() => deauthorize(device)}
                >
                  {busyId === device.id ? t("devices.removing") : t("devices.deauthorize")}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
