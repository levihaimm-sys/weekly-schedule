"use client";

import { useState, useTransition } from "react";
import { MapPin, MessageSquare, Pencil, X, Check, Loader2 } from "lucide-react";
import { updateLocationNotes } from "@/lib/actions/schedule";

interface LocationCardProps {
  location: {
    id: string;
    name: string;
    city: string;
    street: string | null;
    age_group: string | null;
    notes: string | null;
    hide_notes_from_instructor: boolean;
  };
}

export function LocationCard({ location }: LocationCardProps) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(location.notes ?? "");
  const [hideFromInstructor, setHideFromInstructor] = useState(
    location.hide_notes_from_instructor
  );
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateLocationNotes(location.id, notes, hideFromInstructor);
      setEditing(false);
    });
  }

  function handleCancel() {
    setNotes(location.notes ?? "");
    setHideFromInstructor(location.hide_notes_from_instructor);
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
          <MapPin size={18} />
        </div>
        <div className="flex-1">
          <p className="font-medium">{location.name}</p>
          {location.street && (
            <p className="text-sm text-muted-foreground">{location.street}</p>
          )}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="עריכת הערה"
        >
          <Pencil size={14} />
        </button>
      </div>

      {location.age_group && (
        <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-xs">
          גיל {location.age_group}
        </span>
      )}

      {/* Show existing note */}
      {!editing && location.notes && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm">
          <MessageSquare size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-amber-900">{location.notes}</p>
            {location.hide_notes_from_instructor && (
              <p className="mt-1 text-xs text-amber-600/70">🔒 מוסתר ממדריכים</p>
            )}
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="mt-3 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="הערה למיקום (למשל: להתקשר לגננת לפני, כניסה מהצד...)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={hideFromInstructor}
              onChange={(e) => setHideFromInstructor(e.target.checked)}
              className="rounded"
            />
            הסתר ממדריכים (הערה פנימית בלבד)
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              שמור
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <X size={12} />
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
