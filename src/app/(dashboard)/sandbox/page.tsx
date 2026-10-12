import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRecurringSchedule, getAllCities, getAllInstructors, getAllLocations } from "@/lib/queries/schedule";
import { SandboxBoard } from "@/components/schedule/sandbox-board";

export const dynamic = "force-dynamic";

// Owner-only playground: a copy of the fixed schedule that is edited in the browser only.
// Nothing here writes to the DB; the copy resets to the real fixed schedule every week.
export default async function SandboxPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_owner")
    .eq("id", session?.user?.id ?? "")
    .single();

  if (!profile?.is_owner) {
    redirect("/dashboard");
  }

  const [schedule, cities, instructors, locations] = await Promise.all([
    getRecurringSchedule({}),
    getAllCities(),
    getAllInstructors(),
    getAllLocations(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">סנדבוקס</h2>

      <div className="rounded-xl border-4 border-red-500 bg-red-50 p-6 text-center shadow-lg">
        <p className="text-3xl font-extrabold text-red-700 md:text-4xl">⚠️ לוח למשחקים בלבד ⚠️</p>
        <p className="mt-3 text-lg font-bold text-red-800 md:text-xl">
          שום דבר כאן לא קבוע, לא נשמר בלוז ולא משתנה בשום מקום אחר.
        </p>
        <p className="mt-2 text-base text-red-700">
          הלוח מתאפס אוטומטית ללוח הקבוע בתחילת כל שבוע (יום ראשון).
        </p>
      </div>

      <SandboxBoard
        schedule={schedule as any[]}
        cities={cities}
        instructors={instructors}
        locations={locations}
      />
    </div>
  );
}
