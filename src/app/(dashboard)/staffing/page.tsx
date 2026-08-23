import { createAdminClient } from "@/lib/supabase/admin";
import { StaffingManager } from "@/components/staffing/staffing-manager";

export default async function StaffingPage() {
  const supabase = createAdminClient();

  const [
    { data: instructors },
    { data: candidates },
    { data: clients },
    { data: availability },
    { data: needs },
    { data: assignments },
  ] = await Promise.all([
    supabase
      .from("instructors")
      .select("id, full_name, phone, work_cities")
      .order("full_name"),
    supabase
      .from("recruitment_candidates")
      .select("id, first_name, last_name, phone, area")
      .eq("is_archived", false)
      .is("converted_instructor_id", null)
      .order("first_name"),
    supabase.from("clients").select("id, name, region").order("name"),
    supabase
      .from("staffing_availability")
      .select("id, instructor_id, candidate_id, region, day_of_week, time_period, start_time, status, notes, created_at")
      .order("created_at"),
    supabase
      .from("staffing_needs")
      .select(
        "id, client_id, client_name_override, region, location_name, address, day_of_week, time_period, start_time, field, lessons_count, status, notes, created_at"
      )
      .order("created_at"),
    supabase
      .from("staffing_assignments")
      .select("id, need_id, instructor_id, candidate_id, availability_id, assigned_day_of_week, is_confirmed, notes, created_at")
      .order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">שיבוץ שנה הבאה</h2>
      <StaffingManager
        instructors={instructors ?? []}
        candidates={candidates ?? []}
        clients={clients ?? []}
        availability={availability ?? []}
        needs={needs ?? []}
        assignments={assignments ?? []}
      />
    </div>
  );
}
