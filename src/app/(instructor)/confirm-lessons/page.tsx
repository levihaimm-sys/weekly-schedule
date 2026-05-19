import { createClient } from "@/lib/supabase/server";
import { CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { redirect } from "next/navigation";
import { MonthSelector } from "@/components/schedule/month-selector";
import { ConfirmLessonsFilters } from "@/components/schedule/confirm-lessons-filters";
import { BulkConfirmLessons } from "@/components/schedule/bulk-confirm-lessons";

export const dynamic = "force-dynamic";

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export default async function ConfirmLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; garden?: string; city?: string; date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get instructor profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("instructor_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.instructor_id) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        לא נמצא פרופיל מדריך מקושר
      </div>
    );
  }

  // Determine which month to show
  const now = new Date();
  const selectedMonth = params.month
    ? new Date(params.month + "-01")
    : now;
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthLabel = `${MONTHS_HEBREW[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
  const currentMonthStr = format(now, "yyyy-MM");
  const prevMonthStr = format(subMonths(now, 1), "yyyy-MM");

  // Build query for lessons
  let query = supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor_absence_request,
      instructor_request_type,
      instructor_notes,
      location:locations!lessons_location_id_fkey(id, name, city, street)
    `
    )
    .eq("instructor_id", profile.instructor_id);

  // Apply date filters
  if (params.date) {
    // Specific date
    query = query.eq("lesson_date", params.date);
  } else {
    // Month range
    query = query.gte("lesson_date", monthStart).lte("lesson_date", monthEnd);
  }

  query = query.order("lesson_date").order("start_time");

  const { data: lessons } = await query;

  // Fetch signatures
  const lessonIds = (lessons ?? []).map((l) => l.id);
  const sigMap: Record<
    string,
    { signer_name: string; signer_role: string; signature_url: string | null }
  > = {};
  if (lessonIds.length > 0) {
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role, signature_url")
      .in("lesson_id", lessonIds);
    for (const sig of signatures ?? []) {
      sigMap[sig.lesson_id] = {
        signer_name: sig.signer_name,
        signer_role: sig.signer_role,
        signature_url: sig.signature_url,
      };
    }
  }

  // Apply client-side filters (for location data)
  let filteredLessons = lessons ?? [];
  
  if (params.garden) {
    filteredLessons = filteredLessons.filter((l: any) =>
      l.location?.name?.toLowerCase().includes(params.garden!.toLowerCase())
    );
  }
  
  if (params.city) {
    filteredLessons = filteredLessons.filter((l: any) =>
      l.location?.city?.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  const allLessons = filteredLessons;
  const confirmedCount = allLessons.filter((l) => sigMap[l.id]).length;
  const scheduledCount = allLessons.filter(
    (l) => l.status === "scheduled" || l.status === "completed"
  ).length;

  // Get unique cities and gardens for filter options
  const allLessonsData = lessons ?? [];
  const uniqueCities = Array.from(
    new Set(allLessonsData.map((l: any) => l.location?.city).filter(Boolean))
  ).sort();
  const uniqueGardens = Array.from(
    new Set(allLessonsData.map((l: any) => l.location?.name).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-foreground print:text-3xl">
        דיווחים - {profile.display_name}
      </h2>

      {/* Month selector */}
      <MonthSelector
        currentMonthStr={currentMonthStr}
        prevMonthStr={prevMonthStr}
        selectedMonth={params.month ?? currentMonthStr}
        monthLabel={monthLabel}
      />

      {/* Filters */}
      <ConfirmLessonsFilters
        cities={uniqueCities as string[]}
        gardens={uniqueGardens as string[]}
        currentFilters={{
          garden: params.garden,
          city: params.city,
          date: params.date,
        }}
      />

      {/* Summary - COMPACT */}
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-5 py-3 shadow-sm">
        <CheckCircle size={20} className="text-success" />
        <span className="font-bold text-base text-foreground">
          {confirmedCount} מאושרים מתוך {scheduledCount} שיעורים
        </span>
      </div>

      {/* Lessons list with multi-select */}
      <BulkConfirmLessons lessons={allLessons as any} sigMap={sigMap} />
    </div>
  );
}
