"use client";

import { useState } from "react";
import { Users, Building2, GitMerge, BarChart3 } from "lucide-react";
import { AvailabilityTab } from "./availability-tab";
import { NeedsTab } from "./needs-tab";
import { MatchingTab } from "./matching-tab";
import { SummaryTab } from "./summary-tab";
import type { StaffingAvailability, StaffingNeed, StaffingAssignment } from "@/types/database";

interface Props {
  availability: StaffingAvailability[];
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
}

const TABS = [
  { key: "matching", label: "שיבוצים", icon: GitMerge },
  { key: "availability", label: "מדריכים וזמינות", icon: Users },
  { key: "needs", label: "לקוחות ושיעורים נדרשים", icon: Building2 },
  { key: "summary", label: "סיכום לפי ישוב", icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function StaffingManager({ availability, needs, assignments }: Props) {
  const [tab, setTab] = useState<TabKey>("matching");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-primary text-[#1C1917]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "matching" && <MatchingTab availability={availability} needs={needs} assignments={assignments} />}
      {tab === "availability" && <AvailabilityTab availability={availability} assignments={assignments} needs={needs} />}
      {tab === "needs" && <NeedsTab needs={needs} />}
      {tab === "summary" && <SummaryTab needs={needs} />}
    </div>
  );
}
