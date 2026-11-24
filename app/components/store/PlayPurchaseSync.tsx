"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";
import {
  hasPlayBilling,
  onPlayPurchasesUpdated,
  restorePlayPurchases,
} from "@/app/lib/store/playBilling";

/**
 * Play app only: on launch (and whenever Google reports
 * a purchase outside a Buy tap, e.g. a pending UPI payment completing)
 * hand any not-yet-confirmed Play purchases to the server, so a book
 * paid for is never left locked. Google's own notification to the
 * server is a second backstop.
 */
// Signed-out visitors are fine: the server is only called when Play
// reports an unconfirmed purchase, and a 401 there is just skipped.
export default function PlayPurchaseSync() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useT();

  useEffect(() => {
    if (!hasPlayBilling()) return;
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    const sync = async () => {
      try {
        const granted = await restorePlayPurchases();
        if (granted > 0 && !cancelled) {
          showToast(t("store.bought"));
          router.refresh();
        }
      } catch (error) {
        console.warn("[play] purchase sync failed", error);
      }
    };

    void sync();
    onPlayPurchasesUpdated(sync)
      .then((off) => {
        if (cancelled) off();
        else unlisten = off;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unlisten?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
