"use client";

/** WhatsApp share for the daily shloka (text + a link back to the site). */
export default function ShareShloka({ text, label }: { text: string; label: string }) {
  function share() {
    const message = `${text}\n\n${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" className="share-book__btn share-book__btn--whatsapp daily-shloka__share" onClick={share}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.53 2 2.05 6.47 2.05 11.98c0 1.76.46 3.48 1.34 5L2 22l5.16-1.35a9.96 9.96 0 0 0 4.88 1.25h.01c5.51 0 9.99-4.47 9.99-9.98 0-2.67-1.04-5.17-2.93-7.06A9.93 9.93 0 0 0 12.04 2zm0 18.2h-.01a8.28 8.28 0 0 1-4.22-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.25 8.25 0 0 1-1.27-4.39c0-4.57 3.72-8.28 8.3-8.28 2.21 0 4.29.86 5.86 2.43a8.23 8.23 0 0 1 2.43 5.86c0 4.57-3.72 8.28-8.3 8.28z" />
      </svg>
      {label}
    </button>
  );
}
