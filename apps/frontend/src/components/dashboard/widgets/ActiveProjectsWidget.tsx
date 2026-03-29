"use client";

import { ChevronLeft, ChevronRight, Briefcase, FileText, Code, Palette, MapPin, Clock } from "lucide-react";
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
    return <Palette className="text-brand-purple" size={20} />;
  }
  if (lower.includes("code") || lower.includes("develop") || lower.includes("app")) {
    return <Code className="text-brand-purple" size={20} />;
  }
  if (lower.includes("write") || lower.includes("content") || lower.includes("blog")) {
    return <FileText className="text-brand-purple" size={20} />;
  }
  return <Briefcase className="text-brand-purple" size={20} />;
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
    <div className="bento-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-brand-purple">Active Projects</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl text-slate-400 hover:text-brand-purple hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            disabled={currentIndex + 2 >= projects.length}
            className="p-2 rounded-xl text-slate-400 hover:text-brand-purple hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Briefcase size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No active projects yet</p>
          <button 
            onClick={() => router.push('/projects/create')}
            className="mt-4 text-xs font-bold text-brand-purple hover:underline"
          >
            Post a new project →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {visibleProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="relative group bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all duration-300 overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                 <div className="flex items-center gap-2">

                  <div className="p-3 bg-purple-50 rounded-2xl text-white transition-colors duration-300">
                    {getProjectIcon(project.title)}
                  </div>
                  <div>

                  <h3 className="text-slate-900 font-bold mb-1 text-black">{project.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock size={12} />
                    <span>Started {new Date(Date.now() - project.daysCompleted * 86400000).toLocaleDateString()}</span>
                  </div>
                  </div>

                 </div>

                  <div className="w-40 h-10 rounded-2xl bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-600 text-xs font-bold font-display">
                    {(project.clientName || project.freelancerName || "U").toUpperCase()}
                  </div>
                </div>


                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="text-brand-purple font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div
                      className="h-full bg-brand-purple rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                       <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white" />
                    </div>
                    <span className="px-3 py-1 bg-purple-50 text-brand-purple text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {project.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

