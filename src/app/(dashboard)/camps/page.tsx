import { createAdminClient } from "@/lib/supabase/admin";
import { CampsManager } from "@/components/camps/camps-manager";
import type { CampRequestWithGroups } from "@/types/database";

export default async function CampsPage() {
  const supabase = createAdminClient();

  const [{ data: requests }, { data: groups }, { data: candidates }, { data: instructors }] = await Promise.all([
    supabase
      .from("camp_requests")
      .select("id, client_name, area, camp_date, num_groups, start_time_note, notes, created_at")
      .order("camp_date"),
    supabase.from("camp_groups").select("id, camp_request_id, group_number, notes, created_at").order("group_number"),
    supabase
      .from("camp_group_candidates")
      .select("id, group_id, instructor_id, is_confirmed, notes, created_at")
      .order("created_at"),
    supabase.from("instructors").select("id, full_name, phone, email, is_active, rotation_order").order("full_name"),
  ]);

  const requestsWithGroups: CampRequestWithGroups[] = (requests ?? []).map((r) => ({
    ...r,
    groups: (groups ?? [])
      .filter((g) => g.camp_request_id === r.id)
      .map((g) => ({
        ...g,
        candidates: (candidates ?? []).filter((c) => c.group_id === g.id),
      })),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">קייטנות</h2>
      <CampsManager requests={requestsWithGroups} instructors={instructors ?? []} />
    </div>
  );
}
