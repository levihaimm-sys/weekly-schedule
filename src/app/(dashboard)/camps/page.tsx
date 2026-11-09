import { createAdminClient } from "@/lib/supabase/admin";
import { CampsManager } from "@/components/camps/camps-manager";
import type { CampRequestWithCandidates, CampSession } from "@/types/database";
import { CampSessionTabs } from "@/components/camps/camp-session-tabs";

export default async function CampsPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const params = await searchParams;
  const supabase = createAdminClient();

  const { data: sessions } = await supabase
    .from("camp_sessions")
    .select("id, name, start_date, end_date, is_archived, created_at")
    .order("is_archived")
    .order("created_at", { ascending: false });

  const allSessions: CampSession[] = sessions ?? [];
  const activeSession = allSessions.find((s) => !s.is_archived);
  const selectedSessionId = params.session || activeSession?.id || allSessions[0]?.id;

  const [{ data: requests }, { data: candidates }, { data: instructors }] = await Promise.all([
    supabase
      .from("camp_requests")
      .select(
        "id, client_name, coordinator_name, area, camp_date, num_groups, start_time_note, notes, moved_to_schedule, camp_session_id, created_at"
      )
      .eq("camp_session_id", selectedSessionId)
      .order("camp_date"),
    supabase
      .from("camp_request_candidates")
      .select("id, camp_request_id, instructor_id, is_confirmed, notes, created_at")
      .order("created_at"),
    supabase.from("instructors").select("id, full_name, phone, email, is_active, rotation_order").order("full_name"),
  ]);

  const requestIds = new Set((requests ?? []).map((r) => r.id));
  const filteredCandidates = (candidates ?? []).filter((c) => requestIds.has(c.camp_request_id));

  const requestsWithCandidates: CampRequestWithCandidates[] = (requests ?? []).map((r) => ({
    ...r,
    candidates: filteredCandidates.filter((c) => c.camp_request_id === r.id),
  }));

  const currentSession = allSessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">קייטנות</h2>
      <CampSessionTabs sessions={allSessions} selectedSessionId={selectedSessionId} />
      {currentSession?.is_archived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          צופה בנתוני ארכיון — {currentSession.name}
        </div>
      )}
      <CampsManager
        requests={requestsWithCandidates}
        instructors={instructors ?? []}
        sessionId={selectedSessionId}
        isArchived={currentSession?.is_archived ?? false}
      />
    </div>
  );
}
