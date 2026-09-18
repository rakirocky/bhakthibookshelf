import { notFound } from "next/navigation";

import ReaderClient from "@/app/components/reader/ReaderClient";

export const metadata = {
  title: "Reading | Bhakthi Bookshelf",
};

/**
 * The reader — app or browser. Everything it needs is on this device
 * already (decrypted in memory, never written back to disk), so it works
 * fully offline once a book has been saved from the Downloads page.
 */
export default async function ReaderPage({
  params,
}: {
  params: Promise<{ downloadId: string }>;
}) {
  const { downloadId } = await params;
  const id = Number(downloadId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return <ReaderClient downloadId={id} />;
}
