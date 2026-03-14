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

const VIOLET       = "#4f3fe0";
const VIOLET_LIGHT = "#eeecfc";

export default function DashboardBrowsePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects]     = useState<ApiProject[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

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
    <div className="space-y-8 py-2">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Browse Projects</h1>
          <p className="text-gray-400 text-sm">Find work that matches your skills</p>
        </div>
        {/* Result count pill */}
        {!loading && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto"
            style={{ background: VIOLET_LIGHT, color: VIOLET }}
          >
            <Briefcase size={14} />
            {filtered.length} open project{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-lg">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by title, description, or skill…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-gray-100 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#c9c3f5")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "")}
        />
      </div>

      {/* ── States ── */}
      {loading ? (

        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin" size={32} style={{ color: VIOLET }} />
          <p className="text-sm text-gray-400 font-medium">Loading projects…</p>
        </div>

      ) : error ? (

        <div className="bg-white border-2 border-gray-100 rounded-3xl py-16 px-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "#fef2f2" }}
          >
            <Briefcase size={24} className="text-red-400" />
          </div>
          <p className="text-gray-700 font-semibold mb-1">Something went wrong</p>
          <p className="text-red-500 text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={loadProjects}
            className="inline-flex items-center gap-2 h-10 px-7 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: VIOLET }}
          >
            Try again
          </button>
        </div>

      ) : filtered.length === 0 ? (

        <div className="bg-white border-2 border-gray-100 rounded-3xl py-16 px-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: VIOLET_LIGHT }}
          >
            <Briefcase size={24} style={{ color: VIOLET }} />
          </div>
          <p className="font-bold text-gray-900 mb-1">
            {searchTerm ? "No projects match your search" : "No open projects right now"}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {searchTerm ? "Try different keywords or clear the search." : "Check back soon for new opportunities."}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-2 h-10 px-7 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: VIOLET_LIGHT, color: VIOLET }}
            >
              Clear search
            </button>
          )}
        </div>

      ) : (

        <div className="grid gap-4">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}?from=browse`}
              className="block bg-white border-2 border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-0.5 group"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#c9c3f5";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px -8px ${VIOLET}1a`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Title + client row */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 flex-1">
                  {project.title}
                </h3>
                {/* Open badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 bg-emerald-50 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Open
                </div>
              </div>

              {/* Client name */}
              <p className="text-xs text-gray-400 font-medium mb-3">
                Posted by{" "}
                <span className="text-gray-600 font-semibold">
                  {project.client?.profile?.name ?? "Client"}
                </span>
              </p>

              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={13} />
                  <span className="font-semibold text-gray-700">
                    {project.budgetMin != null || project.budgetMax != null
                      ? `$${(project.budgetMin ?? 0).toLocaleString()} – $${(project.budgetMax ?? project.budgetMin ?? 0).toLocaleString()}`
                      : "Budget not set"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {project._count?.proposals ?? 0} proposals
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Skills */}
              {(project.skills?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {project.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: VIOLET_LIGHT, color: VIOLET, borderColor: "#c9c3f5" }}
                    >
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 5 && (
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ background: "#f3f4f6", color: "#6b7280", borderColor: "#e5e7eb" }}
                    >
                      +{project.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5 transition-all group-hover:gap-2.5" style={{ color: VIOLET }}>
                  View details <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: VIOLET_LIGHT, color: VIOLET }}
                >
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      )}
    </div>
  );
}