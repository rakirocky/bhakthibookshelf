/**
 * Converts whatever is stored in cover_image / sample_pdf / full_pdf into a
 * URL the browser can actually load.
 *
 * Two cases exist in this DB:
 *  - Old seed data: already a public path, e.g. "/images/books/gita.jpg"
 *    or a full URL — used as-is.
 *  - Anything uploaded through the admin panel: a relative path returned by
 *    uploadFile(), e.g. "storage/covers/xxx.jpg" — storage/ lives outside
 *    public/, so these are served through
 *    app/api/storage/[...path]/route.ts instead of Next's static server.
 */
export function fileUrl(relativePath?: string | null): string {
  if (!relativePath) {
    return "";
  }

  if (
    relativePath.startsWith("/") ||
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  return `/api/${relativePath}`;
}
