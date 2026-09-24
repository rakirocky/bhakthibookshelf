"use client";

import { usePathname } from "next/navigation";

// Client-supplied gold temple frame (pillars, peacock corners, lotus top
// and bottom) around every customer-facing page. The artwork is cut
// into pieces under /public/images/frame so it fits any width/length
// without stretching: corners and centre lotuses keep their shape, the
// flat bands repeat across, and the pillars repeat down (see
// .temple-frame in layout.css). Admin screens and the full-screen
// reader stay unframed.
const UNFRAMED = ["/admin", "/reader"];

export default function TempleFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (UNFRAMED.some((p) => pathname?.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <div className="temple-frame">
      <div className="temple-frame__content">{children}</div>
      <div className="temple-frame__top" aria-hidden="true" />
      <div className="temple-frame__side temple-frame__side--left" aria-hidden="true" />
      <div className="temple-frame__side temple-frame__side--right" aria-hidden="true" />
      <div className="temple-frame__bottom" aria-hidden="true" />
    </div>
  );
}
