import { createClient } from "@/lib/supabase/server";
import { getRecurringSchedule } from "@/lib/queries/schedule";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/date";
import { User, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) {
  const { instructorId } = await params;
  const supabase = await createClient();

  const { data: instructor } = await supabase
    .from("instructors")
    .select("*")
    .eq("id", instructorId)
    .single();

  if (!instructor) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        מדריך לא נמצא
      </div>
    );
  }

  const schedule = await getRecurringSchedule({ instructorId });

  // Group schedule by day
  const byDay: Record<number, any[]> = {};
  for (let d = 0; d < 5; d++) byDay[d] = [];
  for (const item of schedule as any[]) {
    if (byDay[item.day_of_week]) byDay[item.day_of_week].push(item);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/instructors"
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowRight size={14} />
        חזרה לרשימת מדריכים
      </Link>

      {/* Instructor info - compact header */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{instructor.full_name}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {instructor.phone && (
              <span className="flex items-center gap-1">
                <Phone size={13} /> {instructor.phone}
              </span>
            )}
            {instructor.email && (
              <span className="flex items-center gap-1">
                <Mail size={13} /> {instructor.email}
              </span>
            )}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            instructor.is_active
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {instructor.is_active ? "פעיל" : "לא פעיל"}
        </span>
      </div>

      {/* Weekly grid - same style as the master schedule */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">
          לוח שבועי ({schedule.length} שיעורים)
        </h3>

        {schedule.length === 0 ? (
          <p className="text-muted-foreground">אין שיעורים קבועים</p>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((day) => (
              <div key={day} className="space-y-2">
                <div className="rounded-lg bg-primary/10 py-2 text-center text-sm font-bold text-primary">
                  {DAYS_SHORT[day]}
                </div>
                <div className="space-y-2">
                  {byDay[day].length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                      —
                    </div>
                  ) : (
                    byDay[day].map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border bg-background p-2.5"
                      >
                        <p className="text-xs font-bold text-primary">
                          {formatTime(item.start_time)}
                        </p>
                        <p className="mt-0.5 text-sm font-medium leading-tight">
                          {item.location?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.location?.city}
                          {item.location?.street
                            ? ` - ${item.location.street}`
                            : ""}
                        </p>
                        {item.location?.age_group && (
                          <span className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px]">
                            גיל {item.location.age_group}
                          </span>
                        )}
                        {item.group_name && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {item.group_name}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
