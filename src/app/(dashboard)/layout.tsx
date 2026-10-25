import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    .select("role, is_owner, can_view_payroll")
    .eq("id", session?.user?.id ?? "")
    .single();

  if (!session) redirect("/login");
  if (profile?.role !== "admin") redirect("/today");

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        isOwner={!!profile?.is_owner}
        canViewPayroll={!!profile?.can_view_payroll}
      />
      <div className="md:ps-64">
        <AdminTopbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
