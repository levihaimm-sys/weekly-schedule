import { createClient } from "@/lib/supabase/server";
import { InstructorManager } from "@/components/instructors/instructor-manager";

export default async function InstructorsPage() {
  const supabase = await createClient();

  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, phone, email, status, address, work_cities")
    .order("full_name");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מדריכים</h2>
      <InstructorManager instructors={instructors ?? []} />
    </div>
  );
}
