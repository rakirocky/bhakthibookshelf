import { WEBSITE_LABEL, WEBSITE_URL } from "@/app/lib/websiteLink";

/** Tagline under the subscribe action — points app users to the website.
 *  data-native-only: hidden on the website itself (client 2026-09-28). */
export default function WebsiteSubscribeNote({ text }: { text: string }) {
  return (
    <p
      data-native-only
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
