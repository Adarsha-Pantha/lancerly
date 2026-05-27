"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Sparkles, ShieldCheck, Zap } from "lucide-react";

export function FeedDiscoverPanel({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);

  return (
    <section className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-600" />
          <span className="text-sm font-black text-slate-900">Discover Lancerly</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">new</span>
        </div>
        <ChevronDown className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-violet-700" />
                <p className="text-xs font-black text-violet-900 uppercase tracking-wider">Get started</p>
              </div>
              <p className="text-xs text-violet-800/80 mt-2 leading-relaxed">
                Post short updates, like others’ work, and keep your profile strong to get more invites.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700" />
                <p className="text-xs font-black text-emerald-900 uppercase tracking-wider">Safety</p>
              </div>
              <p className="text-xs text-emerald-800/80 mt-2 leading-relaxed">
                Be respectful. Harmful content may be automatically blocked by moderation.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

