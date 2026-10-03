import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractEquipmentTextFromPdf } from "@/lib/utils/pdf-text";

/**
 * Reads the equipment list out of an uploaded lesson-plan PDF. Deliberately a standalone
 * route handler (not a Server Action) so the pdfjs-dist dependency it needs can never end
 * up in the shared Server Actions bundle that every page loads — if this route's import
 * fails, only a request to this route fails, not the whole site.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const equipmentText = await extractEquipmentTextFromPdf(buffer);
    return NextResponse.json({ equipmentText });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "extraction failed" },
      { status: 500 }
    );
  }
}
