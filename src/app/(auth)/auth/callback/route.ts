import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, instructor_id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // First login: try to match email to an instructor
          const { data: instructor } = await supabase
            .from("instructors")
            .select("id, full_name")
            .eq("email", user.email)
            .single();

          if (instructor) {
            await supabase.from("profiles").insert({
              id: user.id,
              role: "instructor",
              instructor_id: instructor.id,
              display_name: instructor.full_name,
              email: user.email,
            });
            return NextResponse.redirect(`${origin}/today`);
          }

          // No matching instructor - redirect to login with error
          return NextResponse.redirect(
            `${origin}/login?error=no_instructor_match`
          );
        }

        // Redirect based on existing role
        if (profile.role === "admin") {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
        return NextResponse.redirect(`${origin}/today`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
