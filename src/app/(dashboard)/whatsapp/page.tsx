import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WhatsAppManager } from "@/components/whatsapp/whatsapp-manager";

export default async function WhatsAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/login");

  // Fetch instructors with opt-in status
  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, phone, whatsapp_opt_in")
    .in("status", ["active", "substitute"])
    .order("full_name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">תזכורות WhatsApp</h1>
      <WhatsAppManager instructors={instructors ?? []} />
    </div>
  );
}
