import { createAdminClient } from "@/lib/supabase/admin";
import { CampsManager } from "@/components/camps/camps-manager";
import type { CampRequestWithCandidates } from "@/types/database";

export default async function CampsPage() {
  const supabase = createAdminClient();

  const [{ data: requests }, { data: candidates }, { data: instructors }] = await Promise.all([
    supabase
      .from("camp_requests")
      .select("id, client_name, area, camp_date, num_groups, start_time_note, notes, created_at")
      .order("camp_date"),
    supabase
      .from("camp_request_candidates")
      .select("id, camp_request_id, instructor_id, is_confirmed, notes, created_at")
      .order("created_at"),
    supabase.from("instructors").select("id, full_name, phone, email, is_active, rotation_order").order("full_name"),
  ]);

  const requestsWithCandidates: CampRequestWithCandidates[] = (requests ?? []).map((r) => ({
    ...r,
    candidates: (candidates ?? []).filter((c) => c.camp_request_id === r.id),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">קייטנות</h2>
      <CampsManager requests={requestsWithCandidates} instructors={instructors ?? []} />
    </div>
  );
}
