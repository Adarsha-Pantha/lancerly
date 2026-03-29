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
  UserCircle2,
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

const BRAND = "#7739DB";

export default function HomePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "best">("recent");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [matches, setMatches] = useState<ApiProject[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);
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

      if (user?.role === "FREELANCER") {
        try {
          const matchData = await get<ApiProject[]>(`/projects/matches`, token);
          setMatches(Array.isArray(matchData) ? matchData : []);
          setMatchError(null);
        } catch (err: any) {
          if (err?.message === "MISSING_SKILLS" || err?.message === "PROFILE_EMBEDDING_PENDING") {
            setMatchError(err.message);
          }
        }
      }
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    if (token) loadProjects();
  }, [token, loadProjects]);

  const baseProjects = (sortBy === "best" && user?.role === "FREELANCER") ? matches : projects;

  const filteredProjects = baseProjects
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "best") {
        return ((b as any).matchScore || 0) - ((a as any).matchScore || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Greeting + Hero Section */}
      <section className="bg-slate-50/50 border-b border-slate-100/80">
        <div className="max-w-[1040px] mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col gap-8">
            
            {/* Full Width Hero Section */}
            <div className="w-full flex flex-col justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                    Hello, {user?.name?.split(" ")[0] || "there"}!
                  </h1>
                  {user?.isSubscribed && (
                    <div className="px-3 py-1 bg-[#6b27d9] text-white text-xs font-black rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                      Pro
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-xl">
                  What&apos;s on your agenda for today?
                </p>
              </motion.div>

              {/* Multi-Column Bento Effect Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative group rounded-[2.5rem] overflow-hidden bg-slate-900 aspect-[21/9] lg:aspect-auto lg:h-[340px] shadow-2xl shadow-indigo-100 border border-slate-200"
              >
                <img 
                  src="https://i0.wp.com/writingmydestiny.com/wp-content/uploads/2023/01/best-wordpress-themes-for-freelance-writers-1-scaled.jpg?fit=1000%2C563&ssl=1" 
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-10 w-full max-w-2xl">
                  <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {user?.role === "CLIENT" ? "Find the best talent for your vision" : "Discover projects that fit your skills"}
                  </h2>
                  <Link 
                    href={user?.role === "CLIENT" ? "/dashboard/projects/new" : "/dashboard"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white group/btn"
                  >
                    {user?.role === "CLIENT" ? "Post a project" : "View dashboard"}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>


      {/* Search + Projects */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* MAIN COLUMN: Available Projects */}
            <div className="lg:col-span-12 max-w-4xl mx-auto w-full">
              {/* Search */}
              <div className="mb-6">
                <div className="flex flex-col items-center justify-between">
                  <div className="relative w-full max-w-lg">
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
              </div>

              {/* Header + Sort Filter */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-slate-800">Available projects</h2>
                  <p className="text-xs text-slate-400">
                    {loading ? "" : `${filteredProjects.length} open`}
                  </p>
                </div>
                {user?.role === "FREELANCER" && (
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                    {(["recent", "best"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSortBy(key)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                        style={
                          sortBy === key
                            ? { backgroundColor: BRAND, color: "#fff" }
                            : { color: "#64748b" }
                        }
                      >
                        {key === "recent" ? "Most Recent" : "Best Match"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-accent" size={24} />
                </div>
              ) : sortBy === "best" && matchError === "MISSING_SKILLS" ? (
                <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                  <Cpu className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">Tell us what you do!</h3>
                  <p className="text-indigo-700/70 text-sm max-w-sm mx-auto mb-6">
                    Add skills to your profile to activate AI matching and see projects tailored to your expertise.
                  </p>
                  <Link 
                    href="/profile" 
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Complete Profile
                  </Link>
                </div>
              ) : sortBy === "best" && filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                  <Cpu className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    {searchQuery ? "No best matches found for this search." : "No high-confidence matches found yet. Try adding more skills!"}
                  </p>
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
                        className="block bg-white rounded-xl border border-slate-200 hover:border-accent/30 hover:shadow-md transition-all group overflow-hidden"
                      >
                        {/* Card top: title + description + skills */}
                        <div className="px-5 pt-5 pb-4">
                          <h3 className="font-semibold text-slate-800 text-base line-clamp-1 group-hover:text-accent transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mt-1 leading-relaxed">
                            {project.description}
                          </p>
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

                        {/* Footer */}
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

                          {/* RIGHT: client, proposals, date */}
                          <div className="flex items-center gap-3 shrink-0">
                            {project.client?.profile?.name && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                  <UserCircle2 size={13} className="text-slate-500" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">
                                  {project.client.profile.name}
                                </span>
                              </div>
                            )}

                            <div className="w-px h-3 bg-slate-200" />

                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Users size={12} />
                              <span>{project._count?.proposals ?? 0}</span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock size={12} />
                              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>
      </section>
    </div>
  );
}