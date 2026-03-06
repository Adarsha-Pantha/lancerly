"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, FileText } from "lucide-react";

type SmartMatchingSidebarProps = {
  role: "CLIENT" | "FREELANCER";
  projects?: { id: string; title: string; matchScore?: number }[];
};

export default function SmartMatchingSidebar({
  role,
  projects = [
    { id: "1", title: "React Native Mobile App Development", matchScore: 95 },
    { id: "2", title: "E-commerce API Integration", matchScore: 88 },
    { id: "3", title: "UI/UX Design for SaaS Dashboard", matchScore: 82 },
  ],
}: SmartMatchingSidebarProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 bg-white hidden xl:block">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} className="text-mint" />
          <h3 className="font-semibold text-brand-purple text-sm">Smart Matching</h3>
        </div>
        <p className="text-xs text-slate-500">
          {role === "FREELANCER"
            ? "AI-recommended projects based on your skills"
            : "AI-recommended freelancers for your projects"}
        </p>
      </div>
      <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {projects.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={role === "FREELANCER" ? `/projects/${p.id}/propose` : `/projects/${p.id}/proposals`}
            className="bento-card p-3 block hover:shadow-soft transition-shadow group"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-purple line-clamp-2 group-hover:text-mint transition-colors">
                  {p.title}
                </p>
                {p.matchScore !== undefined && (
                  <span className="inline-block mt-1 text-xs font-semibold text-mint">
                    {p.matchScore}% match
                  </span>
                )}
              </div>
              <ArrowRight
                size={14}
                className="text-slate-400 group-hover:text-mint shrink-0 transition-colors"
              />
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
