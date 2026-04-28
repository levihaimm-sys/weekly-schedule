"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { InstructorStatusType, EmploymentType } from "@/lib/utils/constants";

export async function addInstructor(formData: FormData) {
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const workCities = (formData.get("work_cities") as string)?.trim();

  if (!fullName) {
    return { error: "יש להזין שם מלא" };
  }

  const supabase = await createClient();

  const { data: newInstructor, error } = await supabase
    .from("instructors")
    .insert({
      full_name: fullName,
      phone: phone || null,
      address: address || null,
      work_cities: workCities || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !newInstructor) {
    return { error: "שגיאה בהוספה: " + error?.message };
  }

  // Auto-create auth user so instructor can log in immediately
  if (phone) {
    const admin = createAdminClient();
    const fakeEmail = `instructor-${newInstructor.id}@app.local`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: fakeEmail,
      password: phone,
      email_confirm: true,
    });

    if (authUser?.user) {
      await admin.from("profiles").insert({
        id: authUser.user.id,
        role: "instructor",
        instructor_id: newInstructor.id,
        display_name: fullName,
        phone,
      });
    } else if (authError) {
      console.error("[addInstructor] Auth user creation failed:", authError.message);
    }
  }

  revalidatePath("/instructors");
  return { success: true };
}

export async function updateInstructor(
  instructorId: string,
  data: { full_name?: string; phone?: string | null; address?: string | null; work_cities?: string | null; rotation_order?: number | null }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("instructors")
    .update(data)
    .eq("id", instructorId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  // If phone changed, sync the auth user's password
  if (data.phone) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("instructor_id", instructorId)
      .single();
    if (profile?.id) {
      await admin.auth.admin.updateUserById(profile.id, { password: data.phone });
    }
  }

  revalidatePath("/instructors");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInstructorStatus(
  instructorId: string,
  status: InstructorStatusType
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("instructors")
    .update({ status })
    .eq("id", instructorId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  // Only revalidate instructors page - no need to revalidate other paths
  revalidatePath("/instructors");
  return { success: true };
}

export async function getInstructorAvailability(instructorId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("instructor_availability")
    .select("day_of_week, city")
    .eq("instructor_id", instructorId)
    .order("day_of_week");

  return data ?? [];
}

export async function getAllAvailability() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("instructor_availability")
    .select("instructor_id, day_of_week, city")
    .order("day_of_week");

  return data ?? [];
}

export async function updateInstructorAvailability(
  instructorId: string,
  availability: { day_of_week: number; city: string }[]
) {
  const supabase = await createClient();

  // Delete existing availability
  const { error: deleteError } = await supabase
    .from("instructor_availability")
    .delete()
    .eq("instructor_id", instructorId);

  if (deleteError) {
    return { error: "שגיאה במחיקת זמינות: " + deleteError.message };
  }

  // Insert new availability
  if (availability.length > 0) {
    const { error: insertError } = await supabase
      .from("instructor_availability")
      .insert(
        availability.map((a) => ({
          instructor_id: instructorId,
          day_of_week: a.day_of_week,
          city: a.city,
        }))
      );

    if (insertError) {
      return { error: "שגיאה בשמירת זמינות: " + insertError.message };
    }
  }

  revalidatePath("/instructors");
  return { success: true };
}

export async function updateRotationOrders(
  updates: { id: string; rotation_order: number }[]
) {
  const supabase = await createClient();

  for (const { id, rotation_order } of updates) {
    await supabase.from("instructors").update({ rotation_order }).eq("id", id);
  }

  revalidatePath("/lesson-plans/assignments");
  revalidatePath("/instructors");
  return { success: true };
}

export async function syncInstructorAuthUsers(
  instructorIds: string[]
): Promise<{ synced: number; errors: string[] }> {
  const admin = createAdminClient();
  const supabase = await createClient();

  // Get instructors with phone numbers
  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, phone")
    .in("id", instructorIds)
    .not("phone", "is", null);

  if (!instructors || instructors.length === 0) return { synced: 0, errors: [] };

  let synced = 0;
  const errors: string[] = [];

  for (const instructor of instructors) {
    const fakeEmail = `instructor-${instructor.id}@app.local`;
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: fakeEmail,
      password: instructor.phone!,
      email_confirm: true,
    });

    if (authUser?.user) {
      await admin.from("profiles").insert({
        id: authUser.user.id,
        role: "instructor",
        instructor_id: instructor.id,
        display_name: instructor.full_name,
        phone: instructor.phone,
      });
      synced++;
    } else if (authError?.message?.includes("already been registered")) {
      // Already exists, skip
    } else if (authError) {
      errors.push(`${instructor.full_name}: ${authError.message}`);
    }
  }

  return { synced, errors };
}

export async function toggleInstructorActive(
  instructorId: string,
  isActive: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("instructors")
    .update({ is_active: isActive })
    .eq("id", instructorId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  revalidatePath("/instructors");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInstructorOnboarding(
  instructorId: string,
  data: {
    employment_type?: EmploymentType | null;
    clients?: string[];
    monthly_report_link?: string | null;
    whatsapp_added?: boolean;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("instructors")
    .update(data)
    .eq("id", instructorId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  revalidatePath("/instructors");
  return { success: true };
}

export async function uploadInstructorFile(formData: FormData) {
  const instructorId = formData.get("instructorId") as string;
  const fileType = formData.get("fileType") as "id_photo" | "contract";
  const file = formData.get("file") as File;

  if (!instructorId || !fileType || !file || file.size === 0) {
    return { error: "נתונים חסרים" };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${instructorId}/${fileType}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("instructor-documents")
    .upload(path, bytes, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "שגיאה בהעלאה: " + uploadError.message };
  }

  const { data: urlData } = admin.storage
    .from("instructor-documents")
    .getPublicUrl(path);

  const column = fileType === "id_photo" ? "id_photo_url" : "contract_url";
  const supabase = await createClient();
  await supabase.from("instructors").update({ [column]: urlData.publicUrl }).eq("id", instructorId);

  revalidatePath("/instructors");
  return { success: true, url: urlData.publicUrl };
}
