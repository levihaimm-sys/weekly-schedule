"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { CLIENT_CITIES, CITY_TO_CLIENT } from "@/lib/utils/constants";

export interface ClientReportLesson {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  instructorName: string;
  locationName: string;
  city: string;
  signerRole: "teacher" | "instructor" | null;
  signerName: string | null;
  signatureUrl: string | null;
}

export interface ClientReportData {
  lessons: ClientReportLesson[];
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
}

export async function getClientReportData(
  client: string,
  month: number,
  year: number
): Promise<{ data?: ClientReportData; error?: string }> {
  const cities = CLIENT_CITIES[client];
  if (!cities || cities.length === 0) return { error: "לקוח לא נמצא" };

  const supabase = createAdminClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: locations } = await supabase
    .from("locations")
    .select("id")
    .in("city", cities);

  const locationIds = (locations ?? []).map((l) => l.id);
  if (locationIds.length === 0)
    return {
      data: {
        lessons: [],
        total: 0,
        completed: 0,
        cancelled: 0,
        teacherConfirmed: 0,
        instructorConfirmed: 0,
      },
    };

  const { data: rawLessons, error } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status,
       instructor:instructors!lessons_instructor_id_fkey(full_name),
       location:locations!lessons_location_id_fkey(name, city),
       signatures(signer_name, signer_role, signature_url)`
    )
    .in("location_id", locationIds)
    .gte("lesson_date", startDate)
    .lte("lesson_date", endDate)
    .order("lesson_date")
    .order("start_time");

  if (error) return { error: "שגיאה בטעינת נתונים: " + error.message };

  const lessons: ClientReportLesson[] = (rawLessons ?? []).map((l: any) => {
    const sig = l.signatures?.[0] ?? null;
    return {
      id: l.id,
      lesson_date: l.lesson_date,
      start_time: l.start_time,
      status: l.status,
      instructorName: l.instructor?.full_name ?? "—",
      locationName: l.location?.name ?? "—",
      city: l.location?.city ?? "—",
      signerRole: sig?.signer_role ?? null,
      signerName: sig?.signer_name ?? null,
      signatureUrl: sig?.signature_url ?? null,
    };
  });

  const completed = lessons.filter((l) => l.status === "completed").length;
  const cancelled = lessons.filter((l) => l.status === "cancelled").length;
  const teacherConfirmed = lessons.filter((l) => l.signerRole === "teacher").length;
  const instructorConfirmed = lessons.filter((l) => l.signerRole === "instructor").length;

  return {
    data: {
      lessons,
      total: lessons.length,
      completed,
      cancelled,
      teacherConfirmed,
      instructorConfirmed,
    },
  };
}

// ─── Monthly Client Summary ───────────────────────────────────────────────────

export interface CitySummary {
  city: string;
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
}

export interface ClientMonthlySummary {
  client: string;
  cities: CitySummary[];
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
}

export async function getMonthlyClientSummary(
  month: number,
  year: number
): Promise<{ data?: ClientMonthlySummary[]; error?: string }> {
  const supabase = createAdminClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: rawLessons, error } = await supabase
    .from("lessons")
    .select(
      `id, status,
       location:locations!lessons_location_id_fkey(city),
       signatures(signer_role)`
    )
    .gte("lesson_date", startDate)
    .lte("lesson_date", endDate);

  if (error) return { error: "שגיאה בטעינת נתונים: " + error.message };

  // Build client → city stats map
  const clientMap = new Map<string, Map<string, CitySummary>>();

  for (const lesson of rawLessons ?? []) {
    const city = (lesson.location as any)?.city ?? "";
    const client = CITY_TO_CLIENT[city];
    if (!client) continue;

    if (!clientMap.has(client)) clientMap.set(client, new Map());
    const cityMap = clientMap.get(client)!;

    if (!cityMap.has(city)) {
      cityMap.set(city, {
        city,
        total: 0,
        completed: 0,
        cancelled: 0,
        teacherConfirmed: 0,
        instructorConfirmed: 0,
      });
    }

    const stats = cityMap.get(city)!;
    stats.total++;
    if (lesson.status === "completed") stats.completed++;
    if (lesson.status === "cancelled") stats.cancelled++;

    const sig = (lesson.signatures as any)?.[0];
    if (sig?.signer_role === "teacher") stats.teacherConfirmed++;
    if (sig?.signer_role === "instructor") stats.instructorConfirmed++;
  }

  const result: ClientMonthlySummary[] = [];
  for (const [client, cityMap] of clientMap.entries()) {
    const cities = [...cityMap.values()].sort((a, b) =>
      a.city.localeCompare(b.city, "he")
    );
    const total = cities.reduce((s, c) => s + c.total, 0);
    if (total === 0) continue;

    result.push({
      client,
      cities,
      total,
      completed: cities.reduce((s, c) => s + c.completed, 0),
      cancelled: cities.reduce((s, c) => s + c.cancelled, 0),
      teacherConfirmed: cities.reduce((s, c) => s + c.teacherConfirmed, 0),
      instructorConfirmed: cities.reduce((s, c) => s + c.instructorConfirmed, 0),
    });
  }

  result.sort((a, b) => a.client.localeCompare(b.client, "he"));
  return { data: result };
}

// ─── Instructor Monthly Summary ───────────────────────────────────────────────

export interface InstructorClientSummary {
  client: string;
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
}

export interface InstructorMonthlySummary {
  instructorName: string;
  clients: InstructorClientSummary[];
  total: number;
  completed: number;
  cancelled: number;
  teacherConfirmed: number;
  instructorConfirmed: number;
}

export async function getInstructorMonthlySummary(
  month: number,
  year: number
): Promise<{ data?: InstructorMonthlySummary[]; error?: string }> {
  const supabase = createAdminClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: rawLessons, error } = await supabase
    .from("lessons")
    .select(
      `id, status,
       instructor:instructors!lessons_instructor_id_fkey(full_name),
       location:locations!lessons_location_id_fkey(city),
       signatures(signer_role)`
    )
    .gte("lesson_date", startDate)
    .lte("lesson_date", endDate);

  if (error) return { error: "שגיאה בטעינת נתונים: " + error.message };

  // Build instructor → client stats map
  const instructorMap = new Map<
    string,
    Map<string, InstructorClientSummary>
  >();

  for (const lesson of rawLessons ?? []) {
    const instructorName =
      (lesson.instructor as any)?.full_name ?? "לא ידוע";
    const city = (lesson.location as any)?.city ?? "";
    const client = CITY_TO_CLIENT[city];
    if (!client) continue;

    if (!instructorMap.has(instructorName))
      instructorMap.set(instructorName, new Map());
    const clientMap = instructorMap.get(instructorName)!;

    if (!clientMap.has(client)) {
      clientMap.set(client, {
        client,
        total: 0,
        completed: 0,
        cancelled: 0,
        teacherConfirmed: 0,
        instructorConfirmed: 0,
      });
    }

    const stats = clientMap.get(client)!;
    stats.total++;
    if (lesson.status === "completed") stats.completed++;
    if (lesson.status === "cancelled") stats.cancelled++;

    const sig = (lesson.signatures as any)?.[0];
    if (sig?.signer_role === "teacher") stats.teacherConfirmed++;
    if (sig?.signer_role === "instructor") stats.instructorConfirmed++;
  }

  const result: InstructorMonthlySummary[] = [];
  for (const [instructorName, clientMap] of instructorMap.entries()) {
    const clients = [...clientMap.values()].sort((a, b) =>
      a.client.localeCompare(b.client, "he")
    );
    result.push({
      instructorName,
      clients,
      total: clients.reduce((s, c) => s + c.total, 0),
      completed: clients.reduce((s, c) => s + c.completed, 0),
      cancelled: clients.reduce((s, c) => s + c.cancelled, 0),
      teacherConfirmed: clients.reduce((s, c) => s + c.teacherConfirmed, 0),
      instructorConfirmed: clients.reduce(
        (s, c) => s + c.instructorConfirmed,
        0
      ),
    });
  }

  result.sort((a, b) =>
    a.instructorName.localeCompare(b.instructorName, "he")
  );
  return { data: result };
}
