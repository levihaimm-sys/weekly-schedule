import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ClientReportDocument } from "@/lib/pdf/report-template";
import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { CLIENT_CITIES } from "@/lib/utils/constants";

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

    const cities = CLIENT_CITIES[clientName as string];
    if (!cities?.length)
      return NextResponse.json({ error: "לקוח לא נמצא" }, { status: 404 });

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data: locations } = await supabase
      .from("locations")
      .select("id, city")
      .in("city", cities);

    const locationIds = (locations ?? []).map((l) => l.id);
    if (!locationIds.length)
      return NextResponse.json(
        { error: "אין שיעורים לתקופה זו" },
        { status: 404 }
      );

    const { data: rawLessons } = await supabase
      .from("lessons")
      .select(
        `id, lesson_date, start_time, status,
         instructor:instructors!lessons_instructor_id_fkey(full_name),
         location:locations!lessons_location_id_fkey(name, city)`
      )
      .in("location_id", locationIds)
      .gte("lesson_date", startDate)
      .lte("lesson_date", endDate)
      .order("lesson_date")
      .order("start_time");

    const lessons = rawLessons ?? [];
    if (!lessons.length)
      return NextResponse.json(
        { error: "אין שיעורים לתקופה זו" },
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

    // Group by city (preserving CLIENT_CITIES order)
    const cityDataMap = new Map<
      string,
      {
        total: number;
        completed: number;
        cancelled: number;
        teacherConfirmed: number;
        instructorConfirmed: number;
        lessons: object[];
      }
    >();

    for (const city of cities) {
      cityDataMap.set(city, {
        total: 0,
        completed: 0,
        cancelled: 0,
        teacherConfirmed: 0,
        instructorConfirmed: 0,
        lessons: [],
      });
    }

    for (const lesson of lessons) {
      const city = (lesson as any).location?.city ?? "";
      if (!cityDataMap.has(city)) continue;

      const d = cityDataMap.get(city)!;
      const sig = sigMap.get((lesson as any).id);

      d.total++;
      if ((lesson as any).status === "completed") d.completed++;
      if ((lesson as any).status === "cancelled") d.cancelled++;
      if (sig?.signer_role === "teacher") d.teacherConfirmed++;
      if (sig?.signer_role === "instructor") d.instructorConfirmed++;

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
        signerRole: sig?.signer_role ?? null,
      });
    }

    const resolvedMode: "full" | "summary" = mode === "summary" ? "summary" : "full";

    const citySections = cities
      .filter((city) => (cityDataMap.get(city)?.total ?? 0) > 0)
      .map((city) => {
        const d = cityDataMap.get(city)!;
        return {
          city,
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
