"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";

type InlineEditableSectionProps = {
  title: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export function InlineEditableSection({
  title,
  value,
  onSave,
  placeholder = "Add...",
  maxLength = 2000,
  multiline = false,
  icon,
  className,
}: InlineEditableSectionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (trimmed === value) { setEditing(false); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (e) {
      setError((e as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setDraft(value); setError(null); setEditing(false); };

  return (
    <div className={cn("profile-card", className)}>
      {/* Violet accent stripe */}
      <div className="profile-card-stripe bg-gradient-to-b from-violet-500 to-fuchsia-500" />

      <div className="profile-card-inner">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-50 border border-violet-200/60 text-violet-700 [&>svg]:size-5">
                {icon}
              </span>
            )}
            <h2 className="text-lg font-black font-display text-foreground tracking-tight">{title}</h2>
          </div>
          {!editing && (
            <button
              onClick={() => { setDraft(value); setEditing(true); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-900 px-3 py-1.5 rounded-xl hover:bg-violet-50 transition-colors border border-violet-200/60"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            {multiline ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={4}
                className="w-full rounded-2xl border border-violet-200 bg-violet-50/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all resize-none"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full rounded-2xl border border-violet-200 bg-violet-50/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all"
                autoFocus
              />
            )}
            {multiline && (
              <p className="text-[10px] text-muted-foreground text-right">{draft.length}/{maxLength}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || draft.trim() === value}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-black hover:brightness-110 transition-all disabled:opacity-50 shadow-md"
              >
                <Check className="size-4" />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-border text-sm font-bold hover:bg-muted transition-all disabled:opacity-50"
              >
                <X className="size-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
            {value || <span className="italic opacity-60">{placeholder}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
