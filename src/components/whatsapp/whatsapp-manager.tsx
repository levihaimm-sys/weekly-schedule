"use client";

import { useState, useTransition } from "react";
import {
  MessageCircle,
  Send,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  previewReminders,
  sendReminderToInstructor,
  toggleWhatsAppOptIn,
  getWhatsAppLog,
  type PreviewMessage,
} from "@/lib/actions/whatsapp";

interface Instructor {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp_opt_in: boolean | null;
}

type Tab = "preview" | "log" | "opt-in";

export function WhatsAppManager({ instructors }: { instructors: Instructor[] }) {
  const [tab, setTab] = useState<Tab>("preview");
  const [targetDate, setTargetDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [preview, setPreview] = useState<PreviewMessage[] | null>(null);
  const [log, setLog] = useState<any[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFlash(type: "success" | "error", text: string) {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  }

  function loadPreview() {
    startTransition(async () => {
      const result = await previewReminders(targetDate);
      if (result.error) {
        showFlash("error", result.error);
      } else {
        setPreview(result.messages);
      }
    });
  }

  function loadLog() {
    startTransition(async () => {
      const data = await getWhatsAppLog();
      setLog(data);
    });
  }

  async function handleSend(instructorId: string) {
    setSendingId(instructorId);
    const result = await sendReminderToInstructor(instructorId, targetDate);
    setSendingId(null);
    if (result.error) {
      showFlash("error", result.error);
    } else {
      showFlash("success", `נשלח בהצלחה (${result.status})`);
      loadPreview();
    }
  }

  async function handleToggleOptIn(instructorId: string, optIn: boolean) {
    const result = await toggleWhatsAppOptIn(instructorId, optIn);
    if (result.error) {
      showFlash("error", result.error);
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Eye }[] = [
    { key: "preview", label: "תצוגה מקדימה", icon: Eye },
    { key: "log", label: "היסטוריה", icon: History },
    { key: "opt-in", label: "ניהול הרשמה", icon: Users },
  ];

  return (
    <div className="space-y-4">
      {flash && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            flash.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {flash.text}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              if (t.key === "log") loadLog();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Preview tab */}
      {tab === "preview" && (
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">תאריך</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={loadPreview}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
              הצג תצוגה מקדימה
            </button>
          </div>

          {preview && preview.length === 0 && (
            <p className="text-sm text-muted-foreground">אין שיעורים ביום הזה.</p>
          )}

          {preview && preview.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {preview.filter((m) => m.optIn).length} מדריכות עם opt-in מתוך{" "}
                {new Set(preview.map((m) => m.instructorId)).size} סה"כ
              </p>

              {preview.map((msg, i) => (
                <div
                  key={`${msg.instructorId}-${i}`}
                  className={cn(
                    "rounded-lg border p-4 space-y-2",
                    !msg.optIn && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-green-600" />
                      <span className="font-medium">{msg.instructorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {msg.phone}
                      </span>
                      {!msg.phoneValid && (
                        <span className="flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                          <AlertTriangle size={10} /> טלפון לא תקין
                        </span>
                      )}
                      {!msg.optIn && (
                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                          לא רשומה
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSend(msg.instructorId)}
                      disabled={sendingId === msg.instructorId || !msg.phoneValid}
                      className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                    >
                      {sendingId === msg.instructorId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      שלח עכשיו
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    תבנית: {msg.templateName} | {msg.lessonCount} שיעורים
                  </div>

                  <pre
                    dir="rtl"
                    className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-relaxed"
                  >
                    {msg.fullText}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log tab */}
      {tab === "log" && (
        <div className="space-y-3">
          {log === null ? (
            <p className="text-sm text-muted-foreground">טוען...</p>
          ) : log.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין הודעות בלוג.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-right text-xs text-muted-foreground">
                    <th className="pb-2 pe-3">תאריך יעד</th>
                    <th className="pb-2 pe-3">מדריכה</th>
                    <th className="pb-2 pe-3">טלפון</th>
                    <th className="pb-2 pe-3">תבנית</th>
                    <th className="pb-2 pe-3">סטטוס</th>
                    <th className="pb-2 pe-3">שגיאה</th>
                    <th className="pb-2">נשלח</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((row: any) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pe-3">{row.target_date}</td>
                      <td className="py-2 pe-3">
                        {(row.instructor as any)?.full_name ?? "—"}
                      </td>
                      <td className="py-2 pe-3 font-mono text-xs" dir="ltr">
                        {row.phone}
                      </td>
                      <td className="py-2 pe-3 text-xs">{row.template_name}</td>
                      <td className="py-2 pe-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="py-2 pe-3 text-xs text-red-600">
                        {row.error ?? "—"}
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString("he-IL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Opt-in management tab */}
      {tab === "opt-in" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            סמנו מדריכות שהסכימו לקבל תזכורות WhatsApp.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-xs text-muted-foreground">
                  <th className="pb-2 pe-3">מדריכה</th>
                  <th className="pb-2 pe-3">טלפון</th>
                  <th className="pb-2">מקבלת תזכורות</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((inst) => (
                  <OptInRow
                    key={inst.id}
                    instructor={inst}
                    onToggle={handleToggleOptIn}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OptInRow({
  instructor,
  onToggle,
}: {
  instructor: Instructor;
  onToggle: (id: string, v: boolean) => void;
}) {
  const [checked, setChecked] = useState(instructor.whatsapp_opt_in ?? false);

  return (
    <tr className="border-b">
      <td className="py-2 pe-3 font-medium">{instructor.full_name}</td>
      <td className="py-2 pe-3 font-mono text-xs" dir="ltr">
        {instructor.phone ?? "—"}
      </td>
      <td className="py-2">
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              onToggle(instructor.id, e.target.checked);
            }}
            className="peer sr-only"
          />
          <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rtl:peer-checked:after:-translate-x-full" />
        </label>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
        <CheckCircle2 size={10} /> נשלח
      </span>
    );
  if (status === "dry_run")
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
        <Eye size={10} /> dry run
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
      <XCircle size={10} /> נכשל
    </span>
  );
}
