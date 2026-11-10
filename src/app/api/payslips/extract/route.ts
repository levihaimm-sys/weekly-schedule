import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractAllPagesLines } from "@/lib/utils/pdf-text";

/**
 * Returns the text lines of every page of an uploaded payslips PDF (from the accountant).
 * Matching pages to employees and reading "נטו לתשלום" happens on the client, which
 * already knows the month's payees. Standalone route so pdfjs-dist stays out of shared bundles.
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
    const pages = await extractAllPagesLines(buffer);
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "extraction failed" },
      { status: 500 }
    );
  }
}
