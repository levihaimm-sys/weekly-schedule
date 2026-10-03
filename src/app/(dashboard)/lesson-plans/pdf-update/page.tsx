import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PdfUploadManager } from "@/components/lesson-plans/pdf-upload-manager";

export const dynamic = "force-dynamic";

export default async function PdfUpdatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/today");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917] mb-2">עדכון קבצי מערכים</h2>
        <p className="text-gray-600">
          העלאת PDF מעודכן למערך קיים — מחליף את ה-PDF שמוצג למדריכות באפליקציה, ומעדכן את רשימת
          הציוד הנדרש בכל המסכים (ניהול מערכים, התאמת ציוד, מלאי, טבלת חלוקת ציוד ודו&quot;ח ציוד חסר)
        </p>
      </div>

      <PdfUploadManager />
    </div>
  );
}
