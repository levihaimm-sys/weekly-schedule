"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

const HIDDEN_PATHS = ["/my-schedule/monthly"];

export function HideableHeader() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-6 py-4 backdrop-blur shadow-sm">
      <div className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="חיים בתנועה"
          width={180}
          height={60}
          className="h-auto w-auto max-h-12"
          priority
        />
      </div>
    </header>
  );
}
