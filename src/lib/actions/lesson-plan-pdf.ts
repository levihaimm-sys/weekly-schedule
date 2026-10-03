"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const FILENAME_PATTERN = /^מערך\s+(\d+)\s*-.*?(?:\(([^)]+)\))?\.pdf$/i;

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/**
 * Finds the single lesson_plans row a filename refers to, by the lesson number and
 * equipment variant parsed from it (robust to small spelling differences in the title
 * itself, e.g. "היכרות" vs "הכרות").
 */
async function matchFileToLessonPlan(supabase: SupabaseAdmin, fileName: string) {
  const match = fileName.match(FILENAME_PATTERN);

  if (!match) {
    return { status: "invalid_name" as const, message: 'שם הקובץ לא תואם לתבנית "מערך <מספר> - ... .pdf"' };
  }

  const [, number, variant] = match;

  const { data: candidates, error } = await supabase
    .from("lesson_plans")
    .select("id, name, pdf_path")
    .like("name", `מערך ${number} -%`);

  if (error) {
    return { status: "error" as const, message: error.message };
  }

  let rows = candidates ?? [];
  if (variant) {
    const filtered = rows.filter((r) => r.name.includes(`(${variant})`));
    if (filtered.length > 0) rows = filtered;
  }

  if (rows.length === 0) {
    return { status: "not_found" as const, message: "לא נמצא מערך תואם במערכת" };
  }

  if (rows.length > 1) {
    return {
      status: "ambiguous" as const,
      message: `נמצאו ${rows.length} התאמות: ${rows.map((r) => r.name).join(", ")}`,
    };
  }

  return { status: "matched" as const, plan: rows[0] };
}

/**
 * Parses an equipment textarea (one "<quantity> <name>" per line, quantity optional —
 * defaults to 1) the same way the original CSV import did.
 */
function parseEquipmentLines(text: string): Array<{ name: string; quantity: number }> {
  const items: Array<{ name: string; quantity: number }> = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      items.push({ quantity: parseInt(match[1], 10), name: match[2].trim() });
    } else {
      items.push({ quantity: 1, name: line });
    }
  }
  return items;
}

export type MatchResult = {
  fileName: string;
  status: "matched" | "not_found" | "ambiguous" | "invalid_name" | "error";
  message: string;
  planId?: string;
  planName?: string;
  equipmentText?: string;
};

/**
 * Step 1: matches each selected file to a lesson plan and pre-fills its equipment list
 * from what's currently saved in the database, for the admin to review/edit before saving.
 */
export async function matchLessonPlanFiles(formData: FormData): Promise<MatchResult[]> {
  const supabase = createAdminClient();
  const files = formData.getAll("files") as File[];
  const results: MatchResult[] = [];

  for (const file of files) {
    const fileName = file.name;
    const match = await matchFileToLessonPlan(supabase, fileName);

    if (match.status !== "matched") {
      results.push({ fileName, status: match.status, message: match.message });
      continue;
    }

    const { data: equipmentRows } = await supabase
      .from("lesson_plan_equipment")
      .select("quantity, equipment:equipment(name)")
      .eq("lesson_plan_id", match.plan.id);

    const equipmentText = (equipmentRows ?? [])
      .map((row) => `${row.quantity} ${(row.equipment as any)?.name ?? ""}`.trim())
      .join("\n");

    results.push({
      fileName,
      status: "matched",
      message: match.plan.name,
      planId: match.plan.id,
      planName: match.plan.name,
      equipmentText,
    });
  }

  return results;
}

export type ApplyResult = {
  fileName: string;
  status: "ok" | "error";
  message: string;
};

/**
 * Step 2: uploads each file's PDF (replacing what instructors see in the app) and
 * replaces its equipment list in lesson_plan_equipment with the edited one — the single
 * table every admin screen (ניהול מערכים, התאמת ציוד למערך, מלאי ציוד, טבלת חלוקת ציוד,
 * דו"ח ציוד חסר) and the instructor's equipment confirmation list read from.
 *
 * Existing per-lesson instructor_quantity overrides are preserved for equipment that
 * stays on the list; only quantity, additions and removals are applied.
 */
export async function applyLessonPlanUpdates(formData: FormData): Promise<ApplyResult[]> {
  const supabase = createAdminClient();
  const results: ApplyResult[] = [];

  const count = parseInt((formData.get("count") as string) ?? "0", 10);

  for (let i = 0; i < count; i++) {
    const file = formData.get(`file_${i}`) as File | null;
    const planId = formData.get(`planId_${i}`) as string | null;
    const equipmentText = (formData.get(`equipmentText_${i}`) as string) ?? "";

    if (!file || !planId) continue;
    const fileName = file.name;

    const { data: plan, error: planError } = await supabase
      .from("lesson_plans")
      .select("id, name, pdf_path")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      results.push({ fileName, status: "error", message: "המערך לא נמצא יותר במערכת" });
      continue;
    }

    const pdfPath = plan.pdf_path || `lesson-${plan.id}.pdf`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("lesson-plans")
      .upload(pdfPath, buffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      results.push({ fileName, status: "error", message: `העלאת PDF נכשלה: ${uploadError.message}` });
      continue;
    }

    if (!plan.pdf_path) {
      await supabase.from("lesson_plans").update({ pdf_path: pdfPath }).eq("id", plan.id);
    }

    // Sync the equipment list to match what was edited in the textarea.
    const { data: currentRows } = await supabase
      .from("lesson_plan_equipment")
      .select("id, equipment_id, quantity, equipment:equipment(id, name)")
      .eq("lesson_plan_id", plan.id);

    const currentByName = new Map(
      (currentRows ?? []).map((row) => [(row.equipment as any)?.name ?? "", row])
    );

    const newItems = parseEquipmentLines(equipmentText);
    const newNames = new Set(newItems.map((item) => item.name));

    for (const item of newItems) {
      const existing = currentByName.get(item.name);
      if (existing) {
        if (existing.quantity !== item.quantity) {
          await supabase
            .from("lesson_plan_equipment")
            .update({ quantity: item.quantity })
            .eq("id", existing.id);
        }
        continue;
      }

      let equipmentId: string;
      const { data: equipmentRow } = await supabase
        .from("equipment")
        .select("id")
        .eq("name", item.name)
        .maybeSingle();

      if (equipmentRow) {
        equipmentId = equipmentRow.id;
      } else {
        const { data: createdEquipment, error: createError } = await supabase
          .from("equipment")
          .insert({ name: item.name })
          .select("id")
          .single();

        if (createError || !createdEquipment) {
          results.push({
            fileName,
            status: "error",
            message: `לא ניתן היה ליצור פריט ציוד "${item.name}"`,
          });
          continue;
        }
        equipmentId = createdEquipment.id;
      }

      await supabase.from("lesson_plan_equipment").insert({
        lesson_plan_id: plan.id,
        equipment_id: equipmentId,
        quantity: item.quantity,
        equipment_type: "main",
      });
    }

    for (const [name, row] of currentByName) {
      if (!newNames.has(name)) {
        await supabase.from("lesson_plan_equipment").delete().eq("id", row.id);
      }
    }

    results.push({ fileName, status: "ok", message: plan.name });
  }

  revalidatePath("/my-lesson-plan");
  revalidatePath("/today");
  revalidatePath("/lesson-plans/manage");
  revalidatePath("/lesson-plans/weekly-equipment");
  revalidatePath("/lesson-plans/inventory");
  revalidatePath("/lesson-plans/equipment-matching");
  revalidatePath("/lesson-plans/equipment-report");
  revalidatePath("/equipment-distribution");

  return results;
}
