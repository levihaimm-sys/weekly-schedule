"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, ClipboardList, UserCheck } from "lucide-react";
import { CampsManager } from "@/components/camps/camps-manager";
import { CampMatchingTab } from "@/components/camps/camp-matching-tab";
import { CampAvailabilityTab } from "@/components/camps/camp-availability-tab";
import type {
  CampRequestWithCandidates,
  Instructor,
  CampStaffingNeed,
  CampStaffingAvailability,
  CampStaffingAssignment,
  CampSession,
} from "@/types/database";

interface Props {
  activeTab: string;
  sessionId: string;
  session: CampSession;
  requests: CampRequestWithCandidates[];
  instructors: Pick<Instructor, "id" | "full_name" | "phone" | "email" | "is_active" | "rotation_order">[];
  needs: CampStaffingNeed[];
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  isArchived: boolean;
}

const TABS = [
  { key: "matching", label: "שיבוצים", icon: UserCheck },
  { key: "availability", label: "מדריכים וזמינות", icon: Users },
  { key: "requests", label: "בקשות קייטנה", icon: ClipboardList },
] as const;

export function CampStaffingTabs({
  activeTab,
  sessionId,
  session,
  requests,
  instructors,
  needs,
  availability,
  assignments,
  isArchived,
}: Props) {
  const searchParams = useSearchParams();
  const currentSession = searchParams.get("session") || "";

  function tabHref(tab: string) {
    const params = new URLSearchParams();
    if (currentSession) params.set("session", currentSession);
    params.set("tab", tab);
    return `/camps?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={tabHref(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            {label}
            {key === "matching" && needs.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {needs.length}
              </span>
            )}
            {key === "availability" && availability.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {availability.length}
              </span>
            )}
            {key === "requests" && requests.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {requests.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {activeTab === "matching" && (
        <CampMatchingTab
          session={session}
          needs={needs}
          availability={availability}
          assignments={assignments}
          isArchived={isArchived}
        />
      )}

      {activeTab === "availability" && (
        <CampAvailabilityTab
          session={session}
          availability={availability}
          assignments={assignments}
          isArchived={isArchived}
        />
      )}

      {activeTab === "requests" && (
        <CampsManager
          requests={requests}
          instructors={instructors}
          sessionId={sessionId}
          isArchived={isArchived}
        />
      )}
    </div>
  );
}
