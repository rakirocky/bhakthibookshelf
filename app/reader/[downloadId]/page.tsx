import { notFound } from "next/navigation";

import ReaderClient from "@/app/components/reader/ReaderClient";

export const metadata = {
  title: "Reading | Bhakthi Bookshelf",
};

/**
 * The in-app reader. Everything it needs is on the device already, so
 * this page works fully offline; on the website there is nothing to open.
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
