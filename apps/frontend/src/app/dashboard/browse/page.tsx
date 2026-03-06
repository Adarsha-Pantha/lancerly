"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import {
  Search,
  DollarSign,
  Users,
  Clock,
  Briefcase,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface ApiProject {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  status: string;
  createdAt: string;
  client: {
    id: string;
    profile: { name: string; avatarUrl?: string | null } | null;
  };
  _count: { proposals: number };
}

export default function DashboardBrowsePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "OPEN");
      params.set("type", "CLIENT_REQUEST");
      const list = await get<ApiProject[]>(`/projects?${params.toString()}`, token ?? undefined);
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = projects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
        <p className="text-slate-500 text-sm mt-1">Find work that matches your skills</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by title, description, or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-sm"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        {loading ? "Loading..." : `${filtered.length} open projects`}
      </p>

      {/* Projects list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            type="button"
            onClick={loadProjects}
            className="text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">
            {searchTerm ? "No projects match your search." : "No open projects right now."}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-accent hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-slate-800 mb-1.5 line-clamp-1">{project.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-2 mb-3">{project.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  {project.budgetMin != null || project.budgetMax != null
                    ? `$${(project.budgetMin ?? 0).toLocaleString()} - $${(project.budgetMax ?? project.budgetMin ?? 0).toLocaleString()}`
                    : "Budget not set"}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {project._count?.proposals ?? 0} proposals
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <span className="text-slate-700 font-medium">
                  {project.client?.profile?.name ?? "Client"}
                </span>
              </div>

              {(project.skills?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 5 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
                      +{project.skills.length - 5}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1 text-accent text-sm font-medium">
                View details <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
