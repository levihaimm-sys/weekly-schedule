"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Teacher confirmation: upload signature image + create record.
 * Sets signer_role to 'teacher' and lesson status to 'completed'.
 */
export async function uploadSignature(
  lessonId: string,
  signerName: string,
  signatureBase64: string,
  confirmedStartTime?: string,
  confirmedDuration?: number
) {
  const supabase = createAdminClient();

  // Convert base64 to buffer
  const base64Data = signatureBase64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Upload to Supabase Storage
  const filePath = `signatures/${lessonId}.png`;
  const { error: uploadError } = await supabase.storage
    .from("signatures")
    .upload(filePath, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    return { error: "שגיאה בהעלאת החתימה: " + uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("signatures").getPublicUrl(filePath);

  // Build signature record
  const record: Record<string, unknown> = {
    lesson_id: lessonId,
    signer_name: signerName,
    signer_role: "teacher",
    signature_url: publicUrl,
    signed_at: new Date().toISOString(),
  };

  // Add time/duration if columns exist (gracefully handled)
  if (confirmedStartTime) record.confirmed_start_time = confirmedStartTime;
  if (confirmedDuration) record.confirmed_duration = confirmedDuration;

  // Insert signature record
  const { error: insertError } = await supabase
    .from("signatures")
    .upsert(record, { onConflict: "lesson_id" });

  if (insertError) {
    // If columns don't exist, retry without them
    if (insertError.message.includes("confirmed_")) {
      const { error: retryError } = await supabase
        .from("signatures")
        .upsert(
          {
            lesson_id: lessonId,
            signer_name: signerName,
            signer_role: "teacher",
            signature_url: publicUrl,
            signed_at: new Date().toISOString(),
          },
          { onConflict: "lesson_id" }
        );
      if (retryError) {
        return { error: "שגיאה בשמירת החתימה: " + retryError.message };
      }
    } else {
      return { error: "שגיאה בשמירת החתימה: " + insertError.message };
    }
  }

  // Update lesson status to completed
  await supabase
    .from("lessons")
    .update({ status: "completed" })
    .eq("id", lessonId);

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");

  return { success: true, url: publicUrl };
}

/**
 * Instructor self-confirmation: create record without signature image.
 * Sets signer_role to 'instructor' and lesson status to 'completed'.
 */
export async function confirmByInstructor(lessonId: string) {
  // Cookie client for auth, admin client for DB writes (bypasses RLS)
  const authClient = await createClient();
  const admin = createAdminClient();

  // Get instructor profile
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return { error: "לא מחובר" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Insert signature record (no image)
  const { error: insertError } = await admin
    .from("signatures")
    .upsert(
      {
        lesson_id: lessonId,
        signer_name: profile?.display_name ?? "מדריכה",
        signer_role: "instructor",
        signature_url: null,
        signed_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id" }
    );

  if (insertError) {
    return { error: "שגיאה באישור: " + insertError.message };
  }

  // Update lesson status to completed
  await admin
    .from("lessons")
    .update({ status: "completed" })
    .eq("id", lessonId);

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Revoke an instructor self-confirmation (no signature).
 * Deletes the signature record and resets lesson status to 'scheduled'.
 */
export async function revokeApproval(lessonId: string) {
  const admin = createAdminClient();

  await admin.from("signatures").delete().eq("lesson_id", lessonId);

  await admin
    .from("lessons")
    .update({ status: "scheduled" })
    .eq("id", lessonId);

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");
  revalidatePath("/today");

  return { success: true };
}

/**
 * Bulk instructor self-confirmation for multiple lessons at once.
 */
export async function bulkConfirmByInstructor(lessonIds: string[]) {
  if (lessonIds.length === 0) return { error: "לא נבחרו שיעורים" };

  const authClient = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { error: "לא מחובר" };

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const signerName = profile?.display_name ?? "מדריכה";
  const now = new Date().toISOString();

  const records = lessonIds.map((lessonId) => ({
    lesson_id: lessonId,
    signer_name: signerName,
    signer_role: "instructor",
    signature_url: null,
    signed_at: now,
  }));

  const { error: insertError } = await admin
    .from("signatures")
    .upsert(records, { onConflict: "lesson_id" });

  if (insertError) return { error: "שגיאה באישור: " + insertError.message };

  await admin
    .from("lessons")
    .update({ status: "completed" })
    .in("id", lessonIds);

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");

  return { success: true, count: lessonIds.length };
}

/**
 * Admin manually confirms a lesson on behalf of the instructor.
 */
export async function adminConfirmLesson(lessonId: string, instructorName: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("signatures")
    .upsert(
      {
        lesson_id: lessonId,
        signer_name: instructorName,
        signer_role: "admin",
        signature_url: null,
        signed_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id" }
    );

  if (error) {
    return { error: "שגיאה באישור: " + error.message };
  }

  await admin.from("lessons").update({ status: "completed" }).eq("id", lessonId);

  revalidatePath("/confirmations");
  revalidatePath("/schedule");
  return { success: true };
}

/**
 * Undo an instructor-initiated cancellation ("לא התקיים").
 * Resets lesson status to 'scheduled' and clears the change_notes.
 */
export async function undoCancellation(lessonId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("lessons")
    .update({ status: "scheduled", change_notes: null })
    .eq("id", lessonId);

  if (error) {
    return { error: "שגיאה בביטול: " + error.message };
  }

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");
  revalidatePath("/today");

  return { success: true };
}

/**
 * Mark lesson as "did not happen" - instructor reports lesson didn't take place.
 * Sets lesson status to 'cancelled' with a note.
 */
export async function markLessonDidNotHappen(lessonId: string) {
  const authClient = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return { error: "לא מחובר" };
  }

  // Update lesson status to cancelled
  const { error } = await admin
    .from("lessons")
    .update({
      status: "cancelled",
      change_notes: "לא התקיים - דווח ע״י המדריכה",
    })
    .eq("id", lessonId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");
  revalidatePath("/dashboard");
  revalidatePath("/today");

  return { success: true };
}
