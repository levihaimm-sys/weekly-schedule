import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { getMe } from "@/lib/queries/me";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { BOT_SPACE_COOKIE, type BotSpace } from "@/bot/lib/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shared with the WhatsApp bot pages (one profile query per request).
  const me = await getMe();
  const profile = me?.profile;

  if (!me) redirect("/login");
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
        botSpaces={botAllowed}
      />
      <div className="md:ps-64">
        <AdminTopbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
