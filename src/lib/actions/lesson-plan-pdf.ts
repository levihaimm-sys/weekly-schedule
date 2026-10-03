"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type PdfSyncResult = {
  fileName: string;
  status: "ok" | "not_found" | "ambiguous" | "invalid_name" | "error";
  message: string;
};

/**
 * Matches each uploaded PDF to a lesson_plans row by the lesson number and equipment
 * variant parsed from its filename (robust to small spelling differences in the title
 * itself, e.g. "היכרות" vs "הכרות"), then uploads it to the "lesson-plans" Storage
 * bucket so it replaces what instructors see in the app for that lesson.
 *
 * Expected filename shape: "מערך <number> - <title> (<variant>).pdf"
 * (the "(<variant>)" part is optional — most lesson plans don't have one).
 */
export async function syncLessonPlanPdfs(formData: FormData): Promise<PdfSyncResult[]> {
  const files = formData.getAll("files") as File[];
  const results: PdfSyncResult[] = [];

  if (files.length === 0) {
    return results;
  }

  const supabase = createAdminClient();

  for (const file of files) {
    const fileName = file.name;
    const match = fileName.match(/^מערך\s+(\d+)\s*-.*?(?:\(([^)]+)\))?\.pdf$/i);

    if (!match) {
      results.push({
        fileName,
        status: "invalid_name",
        message: 'שם הקובץ לא תואם לתבנית "מערך <מספר> - ... .pdf"',
      });
      continue;
    }

    const [, number, variant] = match;

    const { data: candidates, error: findError } = await supabase
      .from("lesson_plans")
      .select("id, name, pdf_path")
      .like("name", `מערך ${number} -%`);

    if (findError) {
      results.push({ fileName, status: "error", message: findError.message });
      continue;
    }

    let rows = candidates ?? [];
    if (variant) {
      const filtered = rows.filter((r) => r.name.includes(`(${variant})`));
      if (filtered.length > 0) rows = filtered;
    }

    if (rows.length === 0) {
      results.push({ fileName, status: "not_found", message: "לא נמצא מערך תואם במערכת" });
      continue;
    }

    if (rows.length > 1) {
      results.push({
        fileName,
        status: "ambiguous",
        message: `נמצאו ${rows.length} התאמות: ${rows.map((r) => r.name).join(", ")}`,
      });
      continue;
    }

    const plan = rows[0];
    const pdfPath = plan.pdf_path || `lesson-${plan.id}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("lesson-plans")
      .upload(pdfPath, buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      results.push({ fileName, status: "error", message: uploadError.message });
      continue;
    }

    if (!plan.pdf_path) {
      const { error: updateError } = await supabase
        .from("lesson_plans")
        .update({ pdf_path: pdfPath })
        .eq("id", plan.id);

      if (updateError) {
        results.push({ fileName, status: "error", message: updateError.message });
        continue;
      }
    }

    results.push({ fileName, status: "ok", message: plan.name });
  }

  revalidatePath("/my-lesson-plan");
  revalidatePath("/lesson-plans/manage");

  return results;
}
