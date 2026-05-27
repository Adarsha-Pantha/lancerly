"use client";

import Link from "next/link";
import { Sparkles, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default function SmartMatchingSidebar({
  role,
}: {
  role: "CLIENT" | "FREELANCER" | "ADMIN";
}) {
  // Kept intentionally lightweight to restore build after file cleanup.
  // You can later replace this with real matching/recommendation widgets.
  return (
    <div className="p-5 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400" />
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600" />
            <p className="text-sm font-black text-slate-900">Smart matching</p>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Personalized recommendations will appear here based on your activity.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href={role === "CLIENT" ? "/dashboard/projects/new" : "/dashboard/browse"}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white hover:bg-violet-700 transition-colors"
            >
              <Zap className="size-4" />
              {role === "CLIENT" ? "Post a project" : "Browse projects"}
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Improve profile <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-700" />
          <p className="text-sm font-black text-emerald-900">Trust tip</p>
        </div>
        <p className="text-xs text-emerald-800/80 mt-2 leading-relaxed">
          Keep communication inside the platform and use milestones for safer collaboration.
        </p>
      </div>
    </div>
  );
}

