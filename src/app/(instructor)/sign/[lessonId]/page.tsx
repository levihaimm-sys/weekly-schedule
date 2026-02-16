import { createClient } from "@/lib/supabase/server";
import { SignaturePad } from "@/components/signature/signature-pad";
import { redirect } from "next/navigation";

export default async function SignPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch lesson details
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `
      id,
      status,
      location:locations!lessons_location_id_fkey(name, city)
    `
    )
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        שיעור לא נמצא
      </div>
    );
  }

  // Check if already signed
  const { data: existingSignature } = await supabase
    .from("signatures")
    .select("id, signer_name, signed_at")
    .eq("lesson_id", lessonId)
    .single();

  if (existingSignature) {
    return (
      <div className="p-8 text-center">
        <div className="rounded-xl border border-success/30 bg-success/10 p-6">
          <p className="text-lg font-bold text-success">השיעור כבר נחתם</p>
          <p className="mt-2 text-sm text-muted-foreground">
            נחתם על ידי: {existingSignature.signer_name}
          </p>
        </div>
      </div>
    );
  }

  const locationName = `${(lesson.location as any)?.name ?? ""} - ${(lesson.location as any)?.city ?? ""}`;

  return <SignaturePad lessonId={lessonId} locationName={locationName} />;
}
