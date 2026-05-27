"use client";

import { cn } from "@/lib/utils";
import { ImagePlus, Send, X } from "lucide-react";

const MAX_CHARS = 2000;

export function FeedComposer({
  userName,
  userAvatarUrl,
  fallbackAvatar,
  content,
  setContent,
  previews,
  onPickFiles,
  onFileChange,
  onRemoveFile,
  isImage,
  posting,
  onSubmit,
  fileInputRef,
  className,
}: {
  userName?: string | null;
  userAvatarUrl?: string | null;
  fallbackAvatar?: string;
  content: string;
  setContent: (v: string) => void;
  previews: string[];
  onPickFiles?: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  isImage?: (url: string) => boolean;
  posting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  className?: string;
}) {
  const remaining = MAX_CHARS - content.length;

  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden", className)}>
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400" />
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {(userName || userAvatarUrl) && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userAvatarUrl || fallbackAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName || "User")}`}
              alt={userName || "You"}
              className="size-10 rounded-2xl border border-slate-200 object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName || "Share an update"}</p>
              <p className="text-[11px] text-slate-400">Post to your network</p>
            </div>
          </div>
        )}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            placeholder="Share an update, ask a question, or show your progress…"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className={cn("text-[11px] font-semibold", remaining < 50 ? "text-rose-600" : "text-slate-400")}>
              {remaining} characters left
            </span>
          </div>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="w-full h-28 object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="w-full h-28 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/55 text-white hover:bg-black/70 transition-colors"
                  aria-label="Remove"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,video/*" onChange={onFileChange} />
            <button
              type="button"
              onClick={() => (onPickFiles ? onPickFiles() : fileInputRef.current?.click())}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <ImagePlus className="size-4" />
              Add media
            </button>
          </div>

          <button
            type="submit"
            disabled={posting}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition-all disabled:opacity-60"
          >
            <Send className="size-4" />
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}

