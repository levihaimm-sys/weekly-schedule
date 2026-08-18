import { createClient } from "@/lib/supabase/server";
import { ClientManager } from "@/components/clients/client-manager";

export default async function ClientsPage() {
  const supabase = await createClient();
  const [{ data: clients }, { data: activities }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase
      .from("client_activities")
      .select("client_id, note, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const lastActivityMap: Record<string, string> = {};
  for (const a of activities ?? []) {
    if (!lastActivityMap[a.client_id]) {
      lastActivityMap[a.client_id] = a.note;
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לקוחות</h2>
      <ClientManager clients={clients ?? []} lastActivityMap={lastActivityMap} />
    </div>
  );
}
