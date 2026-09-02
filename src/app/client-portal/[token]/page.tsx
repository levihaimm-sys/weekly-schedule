import { getClientPortalData } from "@/lib/queries/schedule";
import { DAYS_HEBREW, LESSON_STATUS } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/date";
import { Clock, MapPin, User } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
  scheduled: "bg-blue-50 text-blue-700",
  substitute: "bg-blue-50 text-blue-700",
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getClientPortalData(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <p className="text-lg font-semibold text-muted-foreground">
          קישור לא תקין
        </p>
      </div>
    );
  }

  const { client, lessons } = data;

  const byDate = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const list = byDate.get(lesson.lesson_date) ?? [];
    list.push(lesson);
    byDate.set(lesson.lesson_date, list);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-2xl space-y-5 p-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">לוח שיעורים</p>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
            <p className="text-base font-medium text-muted-foreground">
              אין שיעורים עתידיים מתוכננים כרגע
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {[...byDate.entries()].map(([date, dayLessons]) => {
              const d = new Date(date);
              const dayName = DAYS_HEBREW[d.getDay()];
              const displayDate = date.split("-").reverse().join("/");

              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-accent px-5 py-3 shadow-sm">
                    <span className="text-lg font-bold text-foreground">{dayName}</span>
                    <span className="text-sm font-semibold text-foreground/70">{displayDate}</span>
                  </div>

                  <div className="space-y-3">
                    {dayLessons.map((lesson: any) => (
                      <div key={lesson.id} className="rounded-2xl bg-card p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-foreground/70" />
                              <span className="text-xl font-bold text-foreground">
                                {formatTime(lesson.start_time)}
                              </span>
                            </div>
                            {lesson.framework && (
                              <p className="text-base font-semibold text-foreground">
                                {lesson.framework}
                              </p>
                            )}
                            {lesson.location && (
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <MapPin size={14} />
                                <span>
                                  {lesson.location.name}
                                  {lesson.location.city ? `, ${lesson.location.city}` : ""}
                                </span>
                              </div>
                            )}
                            {lesson.instructor && (
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <User size={14} />
                                <span>{lesson.instructor.full_name}</span>
                              </div>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${
                              STATUS_STYLES[lesson.status] ?? STATUS_STYLES.scheduled
                            }`}
                          >
                            {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
