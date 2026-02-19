import { createClient } from "@/lib/supabase/server";

export async function AdminTopbar() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", session?.user?.id ?? "")
    .single();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end border-b border-border bg-background/95 px-4 backdrop-blur md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium text-[#1C1917]">
          {profile?.display_name?.charAt(0) ?? "?"}
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {profile?.display_name ?? "מנהל"}
        </span>
      </div>
    </header>
  );
}
