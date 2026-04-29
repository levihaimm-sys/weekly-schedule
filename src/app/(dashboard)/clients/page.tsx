import { createClient } from "@/lib/supabase/server";
import { ClientManager } from "@/components/clients/client-manager";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לקוחות</h2>
      <ClientManager clients={clients ?? []} />
    </div>
  );
}
