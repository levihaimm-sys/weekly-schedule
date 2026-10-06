import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClientReportDocument } from "@/lib/pdf/report-template";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import {
  compareCoordinators,
  coordinatorName,
  isGroupedByCoordinator,
} from "@/lib/utils/client-report";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { clientName, month, year, mode } = body;

    if (!clientName || !month || !year) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const { data: recurringRows } = await supabase
      .from("recurring_schedule")
      .select("id, contact_name")
      .eq("client_name", clientName as string);

    const recurringIds = (recurringRows ?? []).map((r) => r.id);
    const recurringContact = new Map(
      (recurringRows ?? []).map((r) => [r.id, r.contact_name as string | null])
    );
    const groupByCoordinator = isGroupedByCoordinator(clientName as string);

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const lessonSelect = `id, lesson_date, start_time, status, contact_name, recurring_item_id,
         instructor:instructors!lessons_instructor_id_fkey(full_name),
         location:locations!lessons_location_id_fkey(name, city)`;

    // A client's lessons are either generated from one of its recurring_schedule
    // rows, or one-off lessons that carry the client name directly (no recurring
    // link at all) — both need to be included.
    const [recurringLessonsRes, oneOffLessonsRes] = await Promise.all([
      recurringIds.length > 0
        ? supabase
            .from("lessons")
            .select(lessonSelect)
            .in("recurring_item_id", recurringIds)
            .gte("lesson_date", startDate)
            .lte("lesson_date", endDate)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("lessons")
        .select(lessonSelect)
        .eq("client_name", clientName as string)
        .gte("lesson_date", startDate)
        .lte("lesson_date", endDate),
    ]);

    const byId = new Map<string, any>();
    for (const l of [...(recurringLessonsRes.data ?? []), ...(oneOffLessonsRes.data ?? [])]) {
      byId.set(l.id, l);
    }
    const lessons = [...byId.values()].sort((a: any, b: any) =>
      a.lesson_date === b.lesson_date
        ? a.start_time.localeCompare(b.start_time)
        : a.lesson_date.localeCompare(b.lesson_date)
    );

    if (!lessons.length)
      return NextResponse.json(
        { error: recurringIds.length ? "אין שיעורים לתקופה זו" : "לקוח לא נמצא" },
        { status: 404 }
      );

    const lessonIds = lessons.map((l: any) => l.id);
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role, signature_url")
      .in("lesson_id", lessonIds);

    const sigMap = new Map(
      (signatures ?? []).map((s) => [s.lesson_id, s])
    );

    // Group by city — or by coordinator, then city, for clients that review the report per coordinator
    const cityDataMap = new Map<
      string,
      {
        coordinator: string | undefined;
        city: string;
        total: number;
        completed: number;
        cancelled: number;
        teacherConfirmed: number;
        instructorConfirmed: number;
        lessons: object[];
      }
    >();

    for (const lesson of lessons) {
      const city = (lesson as any).location?.city ?? "";
      if (!city) continue;
      const coordinator = groupByCoordinator
        ? coordinatorName(
            (lesson as any).contact_name ??
              recurringContact.get((lesson as any).recurring_item_id)
          )
        : undefined;
      const key = `${coordinator ?? ""}\u0000${city}`;
      if (!cityDataMap.has(key)) {
        cityDataMap.set(key, {
          coordinator,
          city,
          total: 0,
          completed: 0,
          cancelled: 0,
          teacherConfirmed: 0,
          instructorConfirmed: 0,
          lessons: [],
        });
      }

      const d = cityDataMap.get(key)!;
      const sig = sigMap.get((lesson as any).id);

      d.total++;
      if ((lesson as any).status === "completed") d.completed++;
      if ((lesson as any).status === "cancelled") d.cancelled++;
      if (sig?.signer_role === "teacher") d.teacherConfirmed++;
      if (sig?.signer_role === "instructor" || sig?.signer_role === "admin") d.instructorConfirmed++;

      const lessonDate = new Date((lesson as any).lesson_date);
      d.lessons.push({
        date: lessonDate.toLocaleDateString("he-IL"),
        dayOfWeek: lessonDate.getDay(),
        time: (lesson as any).start_time.slice(0, 5),
        locationName: (lesson as any).location?.name ?? "—",
        instructorName: (lesson as any).instructor?.full_name ?? "—",
        status: (lesson as any).status,
        signatureUrl: sig?.signature_url ?? null,
        signerName: sig?.signer_name ?? null,
        signerRole: sig?.signer_role === "admin" ? "instructor" : (sig?.signer_role ?? null),
      });
    }

    const resolvedMode: "full" | "summary" = mode === "summary" ? "summary" : "full";

    const citySections = [...cityDataMap.values()]
      .sort(
        (a, b) =>
          compareCoordinators(a.coordinator ?? "", b.coordinator ?? "") ||
          a.city.localeCompare(b.city, "he")
      )
      .map((d) => {
        return {
          coordinator: d.coordinator,
          city: d.city,
          total: d.total,
          completed: d.completed,
          cancelled: d.cancelled,
          teacherConfirmed: d.teacherConfirmed,
          instructorConfirmed: d.instructorConfirmed,
          lessons: resolvedMode === "full" ? d.lessons : undefined,
        };
      });

    const pdfBuffer = await renderToBuffer(
      React.createElement(ClientReportDocument, {
        data: {
          clientName: clientName as string,
          month,
          year,
          mode: resolvedMode,
          cities: citySections as any,
        },
      }) as any
    );

    const encodedFilename = encodeURIComponent(
      `report-${clientName}-${month}-${year}.pdf`
    );
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report.pdf"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה";
    console.error("[reports/generate-client] error:", err);
    return NextResponse.json(
      { error: `שגיאה ביצירת הדוח: ${message}` },
      { status: 500 }
    );
  }
}
