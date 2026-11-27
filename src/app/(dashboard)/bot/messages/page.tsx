import { AppShell, PageBody } from "@/bot/components/AppShell";
import { AutoRefresh } from "@/bot/components/AutoRefresh";
import { formatWhen } from "@/bot/lib/format";
import { requireSpace } from "@/bot/lib/space";

type Row = {
  id: string;
  account_id: string;
  chat_jid: string;
  sender_name: string | null;
  sent_at: string;
  body: string | null;
  kind: string;
  from_me: boolean;
  read_on_phone: boolean;
  chats: { name: string | null; is_group: boolean } | null;
};

const KIND_LABELS: Record<string, string> = {
  voice: "🎤 הודעה קולית",
  image: "🖼️ תמונה",
  video: "🎬 וידאו",
  sticker: "מדבקה",
  document: "📄 מסמך",
  audio: "🎵 קובץ שמע",
  location: "📍 מיקום",
  contact: "👤 איש קשר",
  poll: "📊 סקר",
  deleted: "ההודעה נמחקה",
};

// Stage 2 check page: shows what the worker saved, so we can see it works.
export default async function MessagesPage() {
  const { supabase, space } = await requireSpace();
  const { data, error } = await supabase
    .from("messages")
    .select("id, account_id, chat_jid, sender_name, sent_at, body, kind, from_me, read_on_phone, chats(name, is_group)")
    .eq("account_id", space)
    .order("sent_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <AppShell current="/bot/messages">
    <PageBody title="הודעות אחרונות" subtitle="100 ההודעות האחרונות שהבוט שמר. העמוד הזה הוא רק לבדיקה שהחיבור עובד.">
      <AutoRefresh seconds={15} />

      {error && <p className="text-red-600 text-sm">{error.message}</p>}

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          עוד לא נשמרו הודעות.
        </section>
      ) : (
        <ul className="space-y-2">
          {rows.map((m) => (
            <li
              key={`${m.account_id}-${m.chat_jid}-${m.id}`}
              className="rounded-2xl bg-card border border-line p-3 space-y-1"
            >
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <span className="font-medium text-foreground">
                  {m.from_me ? "אני" : (m.sender_name ?? "לא ידוע")}
                </span>
                <span>·</span>
                <span>{m.chats?.name ?? (m.chats?.is_group ? "קבוצה" : "צ'אט פרטי")}</span>
                <span>·</span>
                <span>{formatWhen(m.sent_at)}</span>
                {!m.from_me && (
                  <span className={m.read_on_phone ? "text-sky-600" : "text-neutral-400"}>
                    {m.read_on_phone ? "✓✓ נקרא בטלפון" : "לא נקרא"}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm">
                {m.body ?? KIND_LABELS[m.kind] ?? m.kind}
                {m.body && KIND_LABELS[m.kind] && m.kind !== "deleted" && (
                  <span className="text-neutral-400"> ({KIND_LABELS[m.kind]})</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageBody>
    </AppShell>
  );
}
