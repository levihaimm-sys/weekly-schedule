import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="md:ps-64">
        <AdminTopbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
