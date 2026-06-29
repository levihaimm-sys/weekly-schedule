import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { InstructorSidebar } from "@/components/layout/instructor-sidebar";
import { HideableHeader } from "@/components/layout/hideable-header";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <InstructorSidebar />
      <HideableHeader />
      <main className="p-6">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
