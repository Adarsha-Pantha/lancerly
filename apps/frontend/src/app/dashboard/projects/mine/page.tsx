"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import {
  Briefcase,
  Plus,
  Loader2,
  DollarSign,
  Clock,
  Users,
  Search,
  UserCircle2,
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  status: string;
  createdAt: string;
  _count: { proposals: number };
}

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  OPEN:        { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e",  label: "Open"        },
  IN_PROGRESS: { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6",  label: "In Progress" },
  COMPLETED:   { bg: "#f8fafc", color: "#475569", dot: "#94a3b8",  label: "Completed"   },
  CANCELLED:   { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444",  label: "Cancelled"   },
};

export default function MyProjectsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login?redirect=/dashboard/projects/mine");
      return;
    }
    if (user?.role !== "CLIENT") {
      router.replace("/dashboard");
      return;
    }
    loadProjects();
  }, [token, user, router]);

  async function loadProjects() {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<Project[]>("/projects/me", token);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">My Projects</h1>
          <p className="text-slate-500 text-sm">Manage and track your posted projects</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-all shrink-0"
        >
          <Plus size={15} />
          Post New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search your projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={24} />
        </div>

      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-700 mb-1">No projects yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            Post your first project to get proposals from talented freelancers.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-accent text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus size={15} />
            Post a Project
          </Link>
        </div>

      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const s = statusConfig[project.status] ?? { bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af", label: project.status };
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white rounded-xl border border-slate-200 hover:border-accent/30 hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Top: title + description + skills */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800 text-base line-clamp-1 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    {/* Status badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{ background: s.bg, color: s.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {s.label}
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm line-clamp-2 mt-1 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Skills */}
                  {(project.skills?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {project.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-md">
                          +{project.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Footer: left = price | right = proposals + date */}
                <div className="flex items-center justify-between gap-4 px-5 py-3">

                  {/* LEFT: price */}
                  <div className="flex items-center gap-1">
                    <DollarSign size={13} className="text-emerald-500 shrink-0" />
                    {project.budgetMin != null || project.budgetMax != null ? (
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">
                        {(project.budgetMin ?? 0).toLocaleString()}
                        {project.budgetMax && project.budgetMax !== project.budgetMin
                          ? `–${project.budgetMax.toLocaleString()}`
                          : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">TBD</span>
                    )}
                  </div>

                  {/* RIGHT: proposals + date */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Users size={12} />
                      <span>{project._count?.proposals ?? 0} proposals</span>
                    </div>

                    <div className="w-px h-3 bg-slate-200" />

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}