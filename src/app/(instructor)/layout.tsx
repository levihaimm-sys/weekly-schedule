import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { InstructorSidebar } from "@/components/layout/instructor-sidebar";
import Image from "next/image";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <InstructorSidebar />
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-6 py-4 backdrop-blur shadow-sm">
        <div className="flex items-center justify-center">
          <Image
            src="/logo.jpg"
            alt="חיים בתנועה"
            width={180}
            height={60}
            className="h-auto w-auto max-h-12"
            priority
          />
        </div>
      </header>
      <main className="p-6">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
