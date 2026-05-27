"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { Sparkles, Zap, ArrowRight, ShieldCheck, Loader2, Briefcase, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type MatchedProject = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  matchScore: number;
  client: { profile: { name: string } | null };
};

export default function SmartMatchingSidebar({
  role,
}: {
  role: "CLIENT" | "FREELANCER" | "ADMIN";
}) {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "FREELANCER" || !token) return;
    setLoading(true);
    get<MatchedProject[]>("/projects/matches", token)
      .then((data) => setMatches(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch((e: any) => {
        if (e?.message === "MISSING_SKILLS") setError("missing_skills");
      })
      .finally(() => setLoading(false));
  }, [role, token]);

  return (
    <div className="p-5 space-y-4">
      {/* Smart Matching Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-violet-600" />
            <p className="text-sm font-semibold text-slate-900">Smart Matching</p>
          </div>

          {role !== "FREELANCER" && (
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              AI-powered recommendations appear here for freelancers based on their profile and skills.
            </p>
          )}

          {role === "FREELANCER" && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-violet-500" />
                </div>
              )}

              {!loading && error === "missing_skills" && (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Add skills to your profile to unlock AI-powered job matches.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Complete profile <ArrowRight className="size-3" />
                  </Link>
                </div>
              )}

              {!loading && !error && matches.length === 0 && (
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  No matches found yet. Make sure your profile has skills and a bio.
                </p>
              )}

              {!loading && !error && matches.length > 0 && (
                <div className="space-y-2 mb-4">
                  {matches.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="block rounded-xl border border-slate-100 bg-slate-50 hover:bg-violet-50 hover:border-violet-200 p-3 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-slate-800 group-hover:text-violet-700 line-clamp-1 transition-colors">
                          {p.title}
                        </p>
                        <span className="shrink-0 text-[10px] font-semibold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full border border-violet-200">
                          {Math.round(p.matchScore * 100)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5">
                        {p.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {(p.budgetMin != null || p.budgetMax != null) && (
                          <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                            <DollarSign className="size-3" />
                            {p.budgetMin?.toLocaleString() ?? "?"}{p.budgetMax ? `–${p.budgetMax.toLocaleString()}` : ""}
                          </span>
                        )}
                        {p.skills?.length > 0 && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {p.skills.slice(0, 2).join(", ")}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 mt-1">
            <Link
              href={role === "CLIENT" ? "/dashboard/projects/new" : "/home?sort=best"}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              <Zap className="size-4" />
              {role === "CLIENT" ? "Post a project" : "See all matches"}
            </Link>
            {role === "FREELANCER" && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Edit profile <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Trust tip */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="size-4 text-emerald-700" />
          <p className="text-sm font-semibold text-emerald-900">Trust tip</p>
        </div>
        <p className="text-xs text-emerald-800/80 leading-relaxed">
          Keep communication inside the platform and use milestones for safer collaboration.
        </p>
      </div>
    </div>
  );
}
