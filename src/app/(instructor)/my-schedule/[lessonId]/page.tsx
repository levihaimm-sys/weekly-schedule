import { createClient } from "@/lib/supabase/server";
import { formatTime, formatDateHebrew } from "@/lib/utils/date";
import { LESSON_STATUS } from "@/lib/utils/constants";
import { getWazeUrl } from "@/lib/utils/waze";
import {
  Clock,
  MapPin,
  Navigation,
  Users,
  PenLine,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city, street, age_group)
    `
    )
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        שיעור לא נמצא
      </div>
    );
  }

  const { data: signature } = await supabase
    .from("signatures")
    .select("id, signer_name, signed_at, signature_url")
    .eq("lesson_id", lessonId)
    .single();

  const location = lesson.location as any;
  const isSigned = !!signature;

  return (
    <div className="space-y-4">
      <Link
        href="/my-schedule"
        className="flex items-center gap-1 text-sm text-orange-600"
      >
        <ArrowRight size={16} />
        חזרה ללוח
      </Link>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1C1917]">{location?.name}</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              lesson.status === "completed"
                ? "bg-green-50 text-green-700"
                : lesson.status === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ??
              lesson.status}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateHebrew(new Date(lesson.lesson_date))}
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-orange-500" />
            <span className="font-medium">{formatTime(lesson.start_time)}</span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-orange-500" />
            <div>
              <p>{location?.city}</p>
              {location?.street && (
                <p className="text-sm text-muted-foreground">
                  {location.street}
                </p>
              )}
            </div>
          </div>

          {location?.age_group && (
            <div className="flex items-center gap-3">
              <Users size={18} className="text-orange-500" />
              <span>גיל {location.age_group}</span>
            </div>
          )}
        </div>

        {lesson.change_notes && (
          <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
            {lesson.change_notes}
          </div>
        )}
      </div>

      {/* Waze Navigation */}
      {location?.street && location?.city && (
        <a
          href={getWazeUrl(location.street, location.city)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          <Navigation size={20} />
          נווט עם Waze
        </a>
      )}

      {/* Signature Section */}
      <div className="rounded-xl border border-border bg-background p-5">
        <h3 className="mb-3 font-semibold">חתימת גננת</h3>
        {isSigned ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 size={20} />
              <span className="font-medium">נחתם</span>
            </div>
            <p className="text-sm text-muted-foreground">
              נחתם על ידי: {signature.signer_name}
            </p>
            {signature.signature_url && (
              <img
                src={signature.signature_url}
                alt="חתימה"
                className="h-24 rounded-lg border border-border bg-white object-contain"
              />
            )}
          </div>
        ) : (
          <Link
            href={`/sign/${lessonId}`}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-secondary/40 bg-secondary/5 px-4 py-4 text-sm font-medium text-orange-600 transition-colors hover:bg-secondary/10"
          >
            <PenLine size={20} />
            לחץ כאן לחתימה
          </Link>
        )}
      </div>
    </div>
  );
}
