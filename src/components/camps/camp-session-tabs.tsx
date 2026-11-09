"use client";

import Link from "next/link";
import { Archive } from "lucide-react";
import type { CampSession } from "@/types/database";

function formatDateRange(start: string, end: string) {
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  return `${sd}.${sm} - ${ed}.${em}`;
}

interface Props {
  sessions: CampSession[];
  selectedSessionId: string | undefined;
}

export function CampSessionTabs({ sessions, selectedSessionId }: Props) {
  const active = sessions.filter((s) => !s.is_archived);
  const archived = sessions.filter((s) => s.is_archived);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((s) => (
        <Link
          key={s.id}
          href={`/camps?session=${s.id}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            s.id === selectedSessionId
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background hover:bg-muted"
          }`}
        >
          {s.name}
          <span className="mr-2 text-xs opacity-70">{formatDateRange(s.start_date, s.end_date)}</span>
        </Link>
      ))}
      {archived.map((s) => (
        <Link
          key={s.id}
          href={`/camps?session=${s.id}`}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${
            s.id === selectedSessionId
              ? "bg-muted text-foreground border border-border"
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Archive size={14} />
          {s.name}
        </Link>
      ))}
    </div>
  );
}
