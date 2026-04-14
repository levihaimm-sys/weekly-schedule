"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "אימייל או סיסמה שגויים" };
  }

  redirect("/dashboard");
}

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: "שגיאה בשליחת הקישור. נסה שוב." };
  }

  return { success: "קישור כניסה נשלח לאימייל שלך!" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Helper function to retry Supabase calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 300
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      // If it's a Next.js redirect, let it through
      if (e?.digest?.startsWith("NEXT_REDIRECT")) {
        throw e;
      }
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw e;
      }
      
      // Wait with exponential backoff before retrying
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retry failed");
}

/**
 * Instructor login via name + phone number.
 * Auto-creates Supabase Auth user + profile if first login.
 */
function normalizePhone(p: string): string {
  return p.replace(/\D/g, "");
}

export async function loginAsInstructor(formData: FormData) {
  const fullName = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!fullName || !phone) {
    return { error: "יש להזין שם מלא ומספר טלפון" };
  }

  try {
    const admin = createAdminClient();

    // Fetch all instructors with phones and match by normalized digits
    const { data: allInstructors, error: fetchError } = await admin
      .from("instructors")
      .select("id, full_name, phone")
      .not("phone", "is", null);

    if (fetchError) {
      return { error: "שגיאה בשאילתת מדריכים: " + fetchError.message };
    }

    const normalizedInput = normalizePhone(phone);
    const instructor = allInstructors?.find(
      (i) => normalizePhone(i.phone || "") === normalizedInput
    );

    if (!instructor) {
      return { error: "מספר טלפון לא נמצא במערכת" };
    }

    // Normalize names: strip invisible unicode chars (RTL marks, ZWNBSP, etc.) and collapse whitespace
    const normalizeName = (s: string) =>
      s.replace(/[\u200b-\u200f\u202a-\u202e\u00a0\ufeff]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const dbName = normalizeName(instructor.full_name);
    const inputName = normalizeName(fullName);
    if (!dbName.includes(inputName) && !inputName.includes(dbName)) {
      return { error: `[DEBUG] DB: "${dbName}" (${[...dbName].map(c=>c.codePointAt(0)?.toString(16)).join(',')}) | INPUT: "${inputName}" (${[...inputName].map(c=>c.codePointAt(0)?.toString(16)).join(',')})` };
    }

    // Deterministic email for this instructor
    const fakeEmail = `instructor-${instructor.id}@app.local`;

    // Ensure auth user exists with retry
    const { data: newUser, error: createError } = await retryWithBackoff(
      () => admin.auth.admin.createUser({
        email: fakeEmail,
        password: phone,
        email_confirm: true,
      })
    );

    if (newUser?.user) {
      // New user - create profile linking to instructor with retry
      await retryWithBackoff(() =>
        admin.from("profiles").insert({
          id: newUser.user.id,
          role: "instructor",
          instructor_id: instructor.id,
          display_name: instructor.full_name,
          phone: instructor.phone,
        })
      );
    } else if (createError?.message?.includes("already been registered")) {
      // User already exists — sync password to current phone in case it changed
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("instructor_id", instructor.id)
        .single();
      if (profile?.id) {
        await admin.auth.admin.updateUserById(profile.id, { password: phone });
      }
    } else if (createError) {
      return { error: "שגיאה ביצירת חשבון: " + createError.message };
    }

    // Sign in with retry
    const supabase = await createClient();
    const { error: signInError } = await retryWithBackoff(
      () => supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: phone,
      })
    );

    if (signInError) {
      return { error: "שגיאה בהתחברות: " + signInError.message };
    }

    redirect("/today");
  } catch (e: any) {
    // If it's a Next.js redirect, let it through
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    
    console.error("[loginAsInstructor] Error:", e);

    if (e?.message?.includes("fetch failed") || e?.code === "ECONNRESET") {
      return { error: "בעיית תקשורת עם השרת. אנא נסה שוב." };
    }

    return { error: "שגיאה בהתחברות: " + (e?.message || "שגיאה לא ידועה") };
  }
}
