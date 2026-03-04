import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { LocationReportDocument } from "@/lib/pdf/report-template";
import { NextRequest, NextResponse } from "next/server";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { locationId, month, year } = body;

    if (!locationId || !month || !year) {
      return NextResponse.json({ error: "Missing locationId, month, or year" }, { status: 400 });
    }

    const { data: location } = await supabase
      .from("locations")
      .select("id, name, city")
      .eq("id", locationId)
      .single();

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    const { data: lessons } = await supabase
      .from("lessons")
      .select(`
        id,
        lesson_date,
        start_time,
        status,
        instructor:instructors!lessons_instructor_id_fkey(full_name)
      `)
      .eq("location_id", locationId)
      .gte("lesson_date", startDate)
      .lte("lesson_date", endDate)
      .order("lesson_date")
      .order("start_time");

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({ error: "אין שיעורים לתקופה זו" }, { status: 404 });
    }

    const lessonIds = lessons.map((l) => l.id);
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role, signature_url")
      .in("lesson_id", lessonIds);

    const sigMap = new Map((signatures ?? []).map((s) => [s.lesson_id, s]));

    const reportLessons = lessons.map((lesson: any) => {
      const sig = sigMap.get(lesson.id);
      const lessonDate = new Date(lesson.lesson_date);
      return {
        date: lessonDate.toLocaleDateString("he-IL"),
        dayOfWeek: lessonDate.getDay(),
        time: lesson.start_time.slice(0, 5),
        instructorName: lesson.instructor?.full_name ?? "—",
        status: lesson.status,
        signatureUrl: sig?.signature_url ?? null,
        signerName: sig?.signer_name ?? null,
        signerRole: sig?.signer_role ?? null,
      };
    });

    const pdfBuffer = await renderToBuffer(
      React.createElement(LocationReportDocument, {
        data: {
          locationName: location.name,
          city: location.city,
          month,
          year,
          lessons: reportLessons,
        },
      }) as any
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="report-${location.name}-${month}-${year}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה";
    console.error("[reports/generate-location] error:", err);
    return NextResponse.json({ error: `שגיאה ביצירת הדוח: ${message}` }, { status: 500 });
  }
}
