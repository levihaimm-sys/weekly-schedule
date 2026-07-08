"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { RecruitmentStatus } from "@/lib/utils/constants";

export async function addCandidate(formData: FormData) {
  const firstName = (formData.get("first_name") as string)?.trim();
  const lastName = (formData.get("last_name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const area = (formData.get("area") as string)?.trim();
  const inquiryDate = (formData.get("inquiry_date") as string)?.trim();

  if (!firstName || !lastName) {
    return { error: "יש להזין שם פרטי ושם משפחה" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("recruitment_candidates").insert({
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone: phone || null,
    area: area || null,
    inquiry_date: inquiryDate || new Date().toISOString().slice(0, 10),
    status: "pending",
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };

  revalidatePath("/recruitment");
  return { success: true };
}

export async function updateCandidate(
  candidateId: string,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string | null;
    phone?: string | null;
    area?: string | null;
    inquiry_date?: string | null;
  }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .update(data)
    .eq("id", candidateId);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  revalidatePath("/recruitment");
  return { success: true };
}

export async function updateCandidateStatus(
  candidateId: string,
  status: RecruitmentStatus
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .update({ status })
    .eq("id", candidateId);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  revalidatePath("/recruitment");
  return { success: true };
}

export async function toggleCandidateArchive(
  candidateId: string,
  isArchived: boolean
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .update({ is_archived: isArchived })
    .eq("id", candidateId);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  revalidatePath("/recruitment");
  return { success: true };
}

export async function convertCandidateToInstructor(candidateId: string) {
  const supabase = createAdminClient();

  const { data: candidate, error: fetchError } = await supabase
    .from("recruitment_candidates")
    .select("first_name, last_name, phone, email")
    .eq("id", candidateId)
    .single();

  if (fetchError || !candidate) {
    return { error: "לא נמצא מועמד" };
  }

  const fullName = `${candidate.first_name} ${candidate.last_name}`;

  const { data: newInstructor, error: insertError } = await supabase
    .from("instructors")
    .insert({
      full_name: fullName,
      phone: candidate.phone || null,
      email: candidate.email || null,
      status: "active",
    })
    .select("id")
    .single();

  if (insertError || !newInstructor) {
    return { error: "שגיאה ביצירת מדריך: " + insertError?.message };
  }

  await supabase
    .from("recruitment_candidates")
    .update({ converted_instructor_id: newInstructor.id, is_archived: true })
    .eq("id", candidateId);

  revalidatePath("/recruitment");
  revalidatePath("/instructors");
  return { success: true, instructorId: newInstructor.id };
}

export async function addActivity(candidateId: string, note: string) {
  if (!note.trim()) return { error: "יש להזין תוכן" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("recruitment_activities").insert({
    candidate_id: candidateId,
    note: note.trim(),
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  return { success: true };
}

export async function bulkDeleteCandidates(ids: string[]) {
  if (!ids.length) return { success: true };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .delete()
    .in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/recruitment");
  return { success: true };
}

export async function bulkArchiveCandidates(ids: string[], isArchived: boolean) {
  if (!ids.length) return { success: true };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .update({ is_archived: isArchived })
    .in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/recruitment");
  return { success: true };
}

export async function deleteCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("recruitment_candidates")
    .delete()
    .eq("id", candidateId);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath("/recruitment");
  return { success: true };
}

export async function uploadCandidateCV(formData: FormData) {
  const candidateId = formData.get("candidateId") as string;
  const file = formData.get("file") as File;

  if (!candidateId || !file || file.size === 0) {
    return { error: "נתונים חסרים" };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${candidateId}/cv.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("recruitment-documents")
    .upload(path, bytes, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "שגיאה בהעלאה: " + uploadError.message };
  }

  const { data: urlData } = admin.storage
    .from("recruitment-documents")
    .getPublicUrl(path);

  await admin
    .from("recruitment_candidates")
    .update({ cv_url: urlData.publicUrl })
    .eq("id", candidateId);

  revalidatePath("/recruitment");
  return { success: true, url: urlData.publicUrl };
}
