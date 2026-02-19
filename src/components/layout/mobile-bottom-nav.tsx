"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, ClipboardCheck, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function MobileBottomNav() {
  const pathname = usePathname();
  const isTodayActive = pathname === "/today";
  const isLessonPlanActive = pathname.startsWith("/my-lesson-plan");
  const isScheduleActive =
    pathname === "/my-schedule" || pathname.startsWith("/my-schedule/");
  const isConfirmActive = pathname.startsWith("/confirm-lessons");

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-40 bg-[#6B6560] shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        <Link
          href="/today"
          className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all rounded-2xl",
            isTodayActive
              ? "text-white bg-white/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <Home size={24} strokeWidth={isTodayActive ? 2.5 : 2} />
          היום
        </Link>
        <Link
          href="/my-lesson-plan"
          className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all rounded-2xl",
            isLessonPlanActive
              ? "text-white bg-white/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <BookOpen size={24} strokeWidth={isLessonPlanActive ? 2.5 : 2} />
          המערך
        </Link>
        <Link
          href="/my-schedule"
          className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all rounded-2xl",
            isScheduleActive
              ? "text-white bg-white/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <CalendarDays size={24} strokeWidth={isScheduleActive ? 2.5 : 2} />
          לוז שבועי
        </Link>
        <Link
          href="/confirm-lessons"
          className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all rounded-2xl",
            isConfirmActive
              ? "text-white bg-white/20"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
        >
          <ClipboardCheck size={24} strokeWidth={isConfirmActive ? 2.5 : 2} />
          דיווחים
        </Link>
      </div>
    </nav>
  );
}
