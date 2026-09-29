import { WEBSITE_LABEL, WEBSITE_URL } from "@/app/lib/websiteLink";

/** Tagline under the subscribe action — points app users to the website.
 *  data-app-only: only in the read-only app. Hidden on the website itself
 *  (client 2026-09-28) and when the app can sell (Admin → "Android app:
 *  allow buying" ON), where it would only steer buyers out of the app. */
export default function WebsiteSubscribeNote({ text }: { text: string }) {
  return (
    <p
      data-app-only
      data-not-ios
      style={{
        marginTop: 14,
        marginBottom: 0,
        textAlign: "center",
        fontSize: 14,
        lineHeight: 1.6,
        color: "var(--color-text-secondary)",
      }}
    >
      {text}{" "}
      <a
        href={`${WEBSITE_URL}/subscribe`}
        target="_blank"
        rel="noopener"
        style={{ color: "var(--color-primary-strong)", fontWeight: 600 }}
      >
        {WEBSITE_LABEL}
      </a>
    </p>
  );
}
