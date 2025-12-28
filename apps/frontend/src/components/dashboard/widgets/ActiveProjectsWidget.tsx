"use client";

import { ChevronLeft, ChevronRight, Briefcase, FileText, Code, Palette } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

const getProjectIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux")) {
    return <Palette className="text-white" size={20} />;
  }
  if (lower.includes("code") || lower.includes("develop") || lower.includes("app")) {
    return <Code className="text-white" size={20} />;
  }
  if (lower.includes("write") || lower.includes("content") || lower.includes("blog")) {
    return <FileText className="text-white" size={20} />;
  }
  return <Briefcase className="text-white" size={20} />;
};

export default function ActiveProjectsWidget({ projects, role }: ActiveProjectsWidgetProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleProjects = projects.slice(currentIndex, currentIndex + 2);

  const next = () => {
    if (currentIndex + 2 < projects.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Active Projects</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            disabled={currentIndex + 2 >= projects.length}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {getProjectIcon(project.title)}
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold">
                {(project.clientName || project.freelancerName || "U").charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">{project.title}</h3>
            <p className="text-white/80 text-sm mb-4">
              by {role === "CLIENT" ? project.freelancerName || "Freelancer" : project.clientName || "Client"}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">Completed: {project.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Days: {project.daysCompleted}/{project.totalDays}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

