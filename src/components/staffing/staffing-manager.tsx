"use client";

import { useState } from "react";
import { Users, Building2, GitMerge, BarChart3, Send, UserPlus } from "lucide-react";
import { AvailabilityTab } from "./availability-tab";
import { NeedsTab } from "./needs-tab";
import { MatchingTab } from "./matching-tab";
import { SummaryTab } from "./summary-tab";
import { InstructorScheduleTab } from "./instructor-schedule-tab";
import { PotentialInstructorsTab } from "./potential-instructors-tab";
import type {
  StaffingAvailability,
  StaffingNeed,
  StaffingAssignment,
  StaffingPotentialInstructor,
  Instructor,
} from "@/types/database";

interface Props {
  availability: StaffingAvailability[];
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
  instructors: Pick<Instructor, "id" | "full_name" | "is_active">[];
  potentialInstructors: StaffingPotentialInstructor[];
}

const TABS = [
  { key: "availability", label: "מדריכים וזמינות", icon: Users, group: "instructors" },
  { key: "potential-instructors", label: "מדריכים פוטנציאלים", icon: UserPlus, group: "instructors" },
  { key: "instructor-schedule", label: "לו\"ז למדריכים", icon: Send, group: "instructors" },
  { key: "matching", label: "שיבוצים", icon: GitMerge, group: "clients" },
  { key: "needs", label: "לקוחות ושיעורים נדרשים", icon: Building2, group: "clients" },
  { key: "summary", label: "סיכום לפי ישוב", icon: BarChart3, group: "clients" },
] as const;

const TAB_GROUPS = [
  { key: "instructors", label: "מדריכים" },
  { key: "clients", label: "לקוחות" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const NOT_SPECIFIED = "לא צוין";

export function StaffingManager({ availability, needs, assignments, instructors, potentialInstructors }: Props) {
  const [tab, setTab] = useState<TabKey>("matching");

  // Drill down from the summary table into the matching table's own filters: they share the
  // same localStorage keys the matching tab already persists itself into, so writing here and
  // then switching tabs makes it mount already filtered to this exact slice.
  function handleNavigateToMatching(filters: { region: string; field: string; clients: string[] }) {
    try {
      localStorage.setItem(
        "staffing-matching-region",
        JSON.stringify(filters.region === NOT_SPECIFIED ? [] : [filters.region])
      );
      localStorage.setItem(
        "staffing-matching-field",
        JSON.stringify(filters.field === NOT_SPECIFIED ? [] : [filters.field])
      );
      localStorage.setItem("staffing-matching-client", JSON.stringify(filters.clients));
      localStorage.setItem("staffing-matching-framework", JSON.stringify([]));
      localStorage.setItem("staffing-matching-day", JSON.stringify([]));
      localStorage.setItem("staffing-matching-status", JSON.stringify([]));
      localStorage.setItem("staffing-matching-search", JSON.stringify(""));
      localStorage.setItem("staffing-matching-sortkeys", JSON.stringify([]));
    } catch {
      // ignore — localStorage unavailable
    }
    setTab("matching");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 border-b border-border">
        {TAB_GROUPS.map((group, gi) => (
          <div
            key={group.key}
            className={`flex flex-wrap items-end gap-1 ${
              gi > 0 ? "border-r border-border pr-4" : ""
            }`}
          >
            <span className="pb-2.5 pl-1 text-xs font-semibold text-muted-foreground/60 whitespace-nowrap">
              {group.label}
            </span>
            {TABS.filter((t) => t.group === group.key).map((t) => (
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
        ))}
      </div>

      {tab === "matching" && <MatchingTab availability={availability} needs={needs} assignments={assignments} />}
      {tab === "availability" && (
        <AvailabilityTab availability={availability} assignments={assignments} needs={needs} instructors={instructors} />
      )}
      {tab === "potential-instructors" && <PotentialInstructorsTab potentialInstructors={potentialInstructors} />}
      {tab === "needs" && <NeedsTab needs={needs} />}
      {tab === "summary" && <SummaryTab needs={needs} onNavigateToMatching={handleNavigateToMatching} />}
      {tab === "instructor-schedule" && <InstructorScheduleTab needs={needs} assignments={assignments} />}
    </div>
  );
}
