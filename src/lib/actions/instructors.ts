"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { InstructorStatusType } from "@/lib/utils/constants";

export async function addInstructor(formData: FormData) {
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const workCities = (formData.get("work_cities") as string)?.trim();

  if (!fullName) {
    return { error: "יש להזין שם מלא" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("instructors").insert({
    full_name: fullName,
    phone: phone || null,
    address: address || null,
    work_cities: workCities || null,
    status: "active",
  });

  if (error) {
    return { error: "שגיאה בהוספה: " + error.message };
  }

  revalidatePath("/instructors");
  return { success: true };
}

export async function updateInstructor(
  instructorId: string,
  data: { full_name?: string; phone?: string | null; address?: string | null; work_cities?: string | null }
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
