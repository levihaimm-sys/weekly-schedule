import { createAdminClient } from "@/lib/supabase/admin";
import { StaffingManager } from "@/components/staffing/staffing-manager";

export default async function StaffingPage() {
  const supabase = createAdminClient();

  const [
    { data: availability },
    { data: needs },
    { data: assignments },
    { data: instructors },
    { data: potentialInstructors },
  ] = await Promise.all([
    supabase
      .from("staffing_availability")
      .select(
        "id, instructor_name, region, day_of_week, time_period, start_time, status, notes, status_updated_at, created_at"
      )
      .order("created_at"),
    supabase
      .from("staffing_needs")
      .select(
        "id, client_name, region, location_name, address, manager_name, contact_name, framework, framework_name, start_date, lesson_duration, day_of_week, time_period, start_time, field, lessons_count, status, notes, created_at"
      )
      .order("created_at"),
    supabase
      .from("staffing_assignments")
      .select(
        "id, need_id, instructor_name, availability_id, assigned_day_of_week, is_confirmed, notes, created_at, converted_at"
      )
      .order("created_at"),
    supabase.from("instructors").select("id, full_name, is_active"),
    supabase
      .from("staffing_potential_instructors")
      .select(
        "id, full_name, phone, region, field, offered_amount, notes, last_contact_note, last_contact_at, created_at"
      )
      .order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">שיבוץ שנה הבאה</h2>
      <StaffingManager
        availability={availability ?? []}
        needs={needs ?? []}
        assignments={assignments ?? []}
        instructors={instructors ?? []}
        potentialInstructors={potentialInstructors ?? []}
      />
    </div>
  );
}
