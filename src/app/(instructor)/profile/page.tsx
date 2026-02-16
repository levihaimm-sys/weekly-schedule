import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone, LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, phone, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">הפרופיל שלי</h2>

      <div className="rounded-xl border border-border bg-background p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={32} />
          </div>
          <div>
            <p className="text-xl font-bold">{profile?.display_name}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.role === "admin" ? "מנהל" : "מדריך"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {profile?.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={18} />
          התנתק
        </button>
      </form>
    </div>
  );
}
