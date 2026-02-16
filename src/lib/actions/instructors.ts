"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { InstructorStatusType } from "@/lib/utils/constants";

export async function addInstructor(formData: FormData) {
  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();

  if (!fullName) {
    return { error: "יש להזין שם מלא" };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("instructors").insert({
    full_name: fullName,
    phone: phone || null,
    address: address || null,
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
  data: { full_name?: string; phone?: string | null; address?: string | null }
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
