import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { createClient } from "@/lib/supabase/server";

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
    .select("is_owner")
    .eq("id", session?.user?.id ?? "")
    .single();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOwner={!!profile?.is_owner} />
      <div className="md:ps-64">
        <AdminTopbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
