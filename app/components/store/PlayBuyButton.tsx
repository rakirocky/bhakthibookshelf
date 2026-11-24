"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Spinner from "@/app/components/ui/Spinner";
import { useToast } from "@/app/context/ToastContext";
import { useT } from "@/app/lib/i18n/I18nProvider";
import { buyWithPlay, StoreError } from "@/app/lib/store/playBilling";

/**
 * "Buy" inside the Play Store app: one product per tap (Play has no
 * cart), paid through Google Play. The server unlocks it; we refresh the
 * page so the book's Save/Read buttons (or the subscription) show up.
 */
export default function PlayBuyButton({
  productId,
  price,
  signedIn,
  returnTo,
  kind = "book",
  className = "btn btn-primary",
}: {
  productId: string;
  price: string | number;
  signedIn: boolean;
  /** Where sign-in should come back to. */
  returnTo: string;
  kind?: "book" | "plan";
  className?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useT();
  const [busy, setBusy] = useState<null | "opening" | "confirming">(null);

  if (!signedIn) {
    return (
      <Link
        href={`/account/login?from=${encodeURIComponent(returnTo)}`}
        className={className}
      >
        {t("store.signIn")}
      </Link>
    );
  }

  async function handleBuy() {
    setBusy("opening");
    try {
      const outcome = await buyWithPlay(productId);
      if (outcome.status === "cancelled") return;
      if (outcome.status === "pending") {
        showToast(t("store.pending"));
        return;
      }
      setBusy("confirming");
      showToast(t(kind === "plan" ? "store.subBought" : "store.bought"));
      router.refresh();
    } catch (error) {
      if (error instanceof StoreError && error.code === "SESSION_EXPIRED") {
        router.push(`/account/login?from=${encodeURIComponent(returnTo)}`);
        return;
      }
      showToast(
        error instanceof Error && error.message ? error.message : t("store.failed"),
        "error"
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleBuy}
      disabled={busy !== null}
    >
      {busy && <Spinner />}
      {busy === "opening"
        ? t("store.opening")
        : busy === "confirming"
          ? t("store.confirming")
          : t("store.buy", { price: String(price) })}
    </button>
  );
}
