"use client";

import { useState } from "react";
import { Users, Building2, GitMerge } from "lucide-react";
import { AvailabilityTab } from "./availability-tab";
import { NeedsTab } from "./needs-tab";
import { MatchingTab } from "./matching-tab";
import type { StaffingAvailability, StaffingNeed, StaffingAssignment } from "@/types/database";
import type { StaffingInstructor, StaffingCandidate, StaffingClient } from "@/types/staffing";

interface Props {
  instructors: StaffingInstructor[];
  candidates: StaffingCandidate[];
  clients: StaffingClient[];
  availability: StaffingAvailability[];
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
}

const TABS = [
  { key: "matching", label: "שיבוצים", icon: GitMerge },
  { key: "availability", label: "מדריכים וזמינות", icon: Users },
  { key: "needs", label: "לקוחות ושיעורים נדרשים", icon: Building2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function StaffingManager({ instructors, candidates, clients, availability, needs, assignments }: Props) {
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

      {tab === "matching" && (
        <MatchingTab
          instructors={instructors}
          candidates={candidates}
          clients={clients}
          availability={availability}
          needs={needs}
          assignments={assignments}
        />
      )}
      {tab === "availability" && (
        <AvailabilityTab instructors={instructors} candidates={candidates} availability={availability} />
      )}
      {tab === "needs" && <NeedsTab clients={clients} needs={needs} />}
    </div>
  );
}
