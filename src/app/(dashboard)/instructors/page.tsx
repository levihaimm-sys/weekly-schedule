import { createClient } from "@/lib/supabase/server";
import { InstructorManager } from "@/components/instructors/instructor-manager";

export default async function InstructorsPage() {
  const supabase = await createClient();

  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, phone, email, status, address")
    .order("full_name");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold md:text-2xl">מדריכים</h2>
      <InstructorManager instructors={instructors ?? []} />
    </div>
  );
}
