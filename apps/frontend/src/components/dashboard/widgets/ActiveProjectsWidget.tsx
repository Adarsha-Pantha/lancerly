"use client";

import { Briefcase, FileText, Code, Palette, Clock, ArrowRight, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  clientName?: string;
  freelancerName?: string;
  progress: number;
  daysCompleted: number;
  totalDays: number;
  status: string;
  avatarUrl?: string;
};

interface ActiveProjectsWidgetProps {
  projects: Project[];
  role: "CLIENT" | "FREELANCER";
}

const PROJECT_COLORS = [
  { bar: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { bar: "bg-sky-500",    light: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200"    },
  { bar: "bg-emerald-500",light: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200"},
  { bar: "bg-amber-500",  light: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  { bar: "bg-rose-500",   light: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200"   },
];

function getIcon(title: string) {
  const l = title.toLowerCase();
  if (l.includes("design") || l.includes("ui")) return <Palette className="size-4" />;
  if (l.includes("code") || l.includes("dev") || l.includes("app")) return <Code className="size-4" />;
  if (l.includes("write") || l.includes("content")) return <FileText className="size-4" />;
  return <Briefcase className="size-4" />;
}

/* Circular SVG progress ring */
function ProgressRing({ percent, color }: { percent: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
      <text
        x="28" y="28"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill="#0f172a"
        transform="rotate(90 28 28)"
      >
        {percent}%
      </text>
    </svg>
  );
}

export default function ActiveProjectsWidget({ projects, role }: ActiveProjectsWidgetProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-violet-100">
            <Folder className="size-4 text-violet-700" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Active Projects</h2>
            <p className="text-[11px] text-slate-400">{projects.length} running</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/contracts/me")}
          className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
        >
          View all <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {projects.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Briefcase className="size-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No active projects</p>
            <p className="text-xs text-slate-400 mt-1">
              {role === "FREELANCER" ? "Browse jobs to find your next project" : "Post a project to get started"}
            </p>
            <button
              onClick={() => router.push(role === "FREELANCER" ? "/home" : "/dashboard/projects/new")}
              className="mt-4 px-4 py-2 rounded-2xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors"
            >
              {role === "FREELANCER" ? "Find work →" : "Post project →"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, idx) => {
              const c = PROJECT_COLORS[idx % PROJECT_COLORS.length];
              const personLabel = role === "FREELANCER" ? project.clientName : project.freelancerName;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className={cn(
                    "group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200",
                    "bg-white hover:shadow-md hover:-translate-y-0.5",
                    c.border
                  )}
                >
                  {/* Icon */}
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl", c.light, c.text)}>
                    {getIcon(project.title)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                        {project.title}
                      </h3>
                      <span className={cn("ml-2 shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full", c.light, c.text)}>
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Progress bar */}
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", c.bar)}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-600 tabular-nums shrink-0">{project.progress}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="size-3 text-slate-400" />
                      <span className="text-[11px] text-slate-400">
                        {role === "FREELANCER" ? "Client" : "Freelancer"}: <span className="font-semibold text-slate-600">{personLabel}</span>
                        {" · "}Day {project.daysCompleted}
                      </span>
                    </div>
                  </div>

                  {/* Progress ring */}
                  <ProgressRing
                    percent={project.progress}
                    color={c.bar.replace("bg-", "").includes("violet") ? "#7c3aed"
                      : c.bar.includes("sky") ? "#0284c7"
                      : c.bar.includes("emerald") ? "#059669"
                      : c.bar.includes("amber") ? "#d97706"
                      : "#e11d48"}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
