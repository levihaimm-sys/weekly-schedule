import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { MonthlyReportDocument } from "@/lib/pdf/report-template";
import { NextRequest, NextResponse } from "next/server";
import React from "react";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { instructorId, month, year } = body;

  if (!instructorId || !month || !year) {
    return NextResponse.json(
      { error: "Missing instructorId, month, or year" },
      { status: 400 }
    );
  }

  // Fetch instructor
  const { data: instructor } = await supabase
    .from("instructors")
    .select("id, full_name")
    .eq("id", instructorId)
    .single();

  if (!instructor) {
    return NextResponse.json(
      { error: "Instructor not found" },
      { status: 404 }
    );
  }

  // Calculate date range for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  // Fetch lessons for this instructor and month
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      location:locations!lessons_location_id_fkey(name, city)
    `
    )
    .eq("instructor_id", instructorId)
    .gte("lesson_date", startDate)
    .lte("lesson_date", endDate)
    .order("lesson_date")
    .order("start_time");

  if (!lessons || lessons.length === 0) {
    return NextResponse.json(
      { error: "אין שיעורים לתקופה זו" },
      { status: 404 }
    );
  }

  // Fetch signatures for these lessons
  const lessonIds = lessons.map((l) => l.id);
  const { data: signatures } = await supabase
    .from("signatures")
    .select("lesson_id, signer_name, signer_role, signature_url")
    .in("lesson_id", lessonIds);

  const sigMap = new Map(
    (signatures ?? []).map((s) => [s.lesson_id, s])
  );

  // Build report data
  const reportLessons = lessons.map((lesson: any) => {
    const sig = sigMap.get(lesson.id);
    const lessonDate = new Date(lesson.lesson_date);
    return {
      date: lessonDate.toLocaleDateString("he-IL"),
      dayOfWeek: lessonDate.getDay(),
      time: lesson.start_time.slice(0, 5),
      locationName: lesson.location?.name ?? "—",
      city: lesson.location?.city ?? "—",
      status: lesson.status,
      signatureUrl: sig?.signature_url ?? null,
      signerName: sig?.signer_name ?? null,
      signerRole: sig?.signer_role ?? null,
    };
  });

  // Generate PDF
  const pdfBuffer = await renderToBuffer(
    React.createElement(MonthlyReportDocument, {
      data: {
        instructorName: instructor.full_name,
        month,
        year,
        lessons: reportLessons,
      },
    }) as any
  );

  // Return PDF as download
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${instructor.full_name}-${month}-${year}.pdf"`,
    },
  });
}
