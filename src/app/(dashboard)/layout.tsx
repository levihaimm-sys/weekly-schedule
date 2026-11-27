import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BOT_SPACE_COOKIE, type BotSpace } from "@/bot/lib/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_owner, can_view_payroll, wa_accounts")
    .eq("id", session?.user?.id ?? "")
    .single();

  if (!session) redirect("/login");
  if (profile?.role !== "admin") redirect("/today");

  // WhatsApp bot section: the world chosen on the bot pages, if allowed.
  const botAllowed = ((profile?.wa_accounts ?? []) as string[]).filter(
    (a): a is BotSpace => a === "personal" || a === "business"
  );
  const savedBotSpace = (await cookies()).get(BOT_SPACE_COOKIE)?.value;
  const botSpace: BotSpace | null = botAllowed.find((a) => a === savedBotSpace) ?? botAllowed[0] ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isOwner={!!profile?.is_owner}
        canViewPayroll={!!profile?.can_view_payroll}
        botSpace={botSpace}
      />
      <div className="md:ps-64">
        <AdminTopbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
