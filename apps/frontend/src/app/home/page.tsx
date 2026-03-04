"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Search,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  Briefcase,
  LayoutDashboard,
  MessageCircle,
  FileText,
  Send,
  Palette,
  Code2,
  PenLine,
  BarChart3,
  Cpu,
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
  client: { profile: { name: string } | null };
  _count: { proposals: number };
}

const popularTags = ["Website design", "Logo", "WordPress", "React", "Mobile app", "SEO", "Content writing"];

const categories = [
  { slug: "design", name: "Design & Creative", icon: Palette, color: "bg-violet-50 text-violet-600 border-violet-100" },
  { slug: "development", name: "Development", icon: Code2, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { slug: "writing", name: "Writing", icon: PenLine, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { slug: "marketing", name: "Marketing", icon: BarChart3, color: "bg-blue-50 text-blue-600 border-blue-100" },
  { slug: "ai", name: "AI & Data", icon: Cpu, color: "bg-rose-50 text-rose-600 border-rose-100" },
];

export default function HomePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/landing");
    }
  }, [authLoading, token, router]);

  const loadProjects = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("status", "OPEN");
      params.set("type", "CLIENT_REQUEST");
      const list = await get<ApiProject[]>(`/projects?${params.toString()}`, token);
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadProjects();
  }, [token, loadProjects]);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
    );
  });

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Greeting + Quick actions */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Welcome back, {user?.name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-slate-500 mt-1">What would you like to do today?</p>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-accent/30 hover:bg-accent/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Dashboard</p>
                <p className="text-xs text-slate-400">Manage work</p>
              </div>
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Messages</p>
                <p className="text-xs text-slate-400">Chat</p>
              </div>
            </Link>
            {user?.role === "CLIENT" ? (
              <Link
                href="/dashboard/projects/new"
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Post Project</p>
                  <p className="text-xs text-slate-400">Hire talent</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/proposals/me"
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Send size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">My Proposals</p>
                  <p className="text-xs text-slate-400">Track bids</p>
                </div>
              </Link>
            )}
            <Link
              href="/contracts/me"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Contracts</p>
                <p className="text-xs text-slate-400">Active work</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cat.color} hover:shadow-sm transition-all whitespace-nowrap`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search + Projects */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    searchQuery === tag
                      ? "bg-accent text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Available projects</h2>
            <p className="text-xs text-slate-400">
              {loading ? "" : `${filteredProjects.length} open`}
            </p>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                {searchQuery ? "No projects match your search." : "No open projects right now."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-accent hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.15) }}
                >
                  <Link
                    href={`/projects/${project.id}`}
                    className="block p-5 bg-white rounded-xl border border-slate-200 hover:border-accent/20 hover:shadow-sm transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1 group-hover:text-accent transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{project.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} />
                            {project.budgetMin != null || project.budgetMax != null
                              ? `$${(project.budgetMin ?? 0).toLocaleString()} – $${(project.budgetMax ?? project.budgetMin ?? 0).toLocaleString()}`
                              : "Budget TBD"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {project._count?.proposals ?? 0} proposals
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                          {project.client?.profile?.name && (
                            <span className="text-slate-600 font-medium">
                              by {project.client.profile.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {(project.skills?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:justify-end sm:max-w-[180px]">
                          {project.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
