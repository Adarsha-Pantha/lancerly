"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserProfilePanel } from "@/components/profile/UserProfilePanel";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import {
  Search,
  Users,
  Clock,
  ArrowRight,
  Loader2,
  Briefcase,
  FileText,
  Send,
  Palette,
  Code2,
  PenLine,
  BarChart3,
  Cpu,
  UserCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Globe,
  Zap,
  Phone,
  CalendarDays,
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
  client: { id: string; profile: { name: string; avatarUrl?: string | null } | null };
  _count: { proposals: number };
}

interface UpcomingMeeting {
  id: string;
  contractId: string;
  title: string;
  scheduledAt: string;
  status: string;
}

const popularSearches = ["React Developer", "UI/UX Design", "Content Writing", "WordPress", "SEO", "Mobile App", "Logo Design"];

const categories = [
  { slug: "design", name: "Design & Creative", icon: Palette, color: "text-violet-600", bg: "bg-violet-50" },
  { slug: "development", name: "Development", icon: Code2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { slug: "writing", name: "Writing & Content", icon: PenLine, color: "text-amber-600", bg: "bg-amber-50" },
  { slug: "marketing", name: "Digital Marketing", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
  { slug: "ai", name: "AI & Data", icon: Cpu, color: "text-rose-600", bg: "bg-rose-50" },
  { slug: "consulting", name: "Consulting", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
];

const BRAND = "#7739DB";

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function HomePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "best">("recent");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [matches, setMatches] = useState<ApiProject[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePanelUserId, setProfilePanelUserId] = useState<string | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);

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
      params.set("limit", "50");
      const res = await get<{ data: ApiProject[] } | ApiProject[]>(`/projects?${params.toString()}`, token);
      setProjects(Array.isArray(res) ? res : ((res as { data: ApiProject[] }).data ?? []));

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

  // Load upcoming meetings
  useEffect(() => {
    if (!token) return;
    get<{ id: string; contractId: string; title: string; scheduledAt: string; status: string }[]>("/meetings/upcoming", token)
      .then((data) => setUpcomingMeetings(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => null);
  }, [token]);

  const baseProjects = (sortBy === "best" && user?.role === "FREELANCER") ? matches : projects;

  const filteredProjects = baseProjects
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery.trim() || (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
      );
      const matchesCat = !activeCategory || (p.skills ?? []).some((s) => s.toLowerCase().includes(activeCategory));
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === "best") return ((b as any).matchScore || 0) - ((a as any).matchScore || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  const isFreelancer = user?.role === "FREELANCER";
  const isClient = user?.role === "CLIENT";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO: Fiverr-style search banner ── */}
      <section
        className="relative py-14 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e0e3e 0%, #3b1c7a 60%, #6b27d9 100%)" }}
      >
        {/* decorative blobs */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-purple-200 text-sm font-medium mb-2 tracking-wide">
              Welcome back,{" "}
              <span className="text-white font-semibold">{user?.name?.split(" ")[0] || "there"}</span>
              {user?.isSubscribed && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full uppercase tracking-wider">
                  Pro
                </span>
              )}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
              {isClient ? "Find the perfect freelancer" : "Find work you'll love"}
            </h1>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={isClient ? "Search for skills or services…" : "Search projects, skills…"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 text-slate-800 text-base outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              className="px-6 py-4 text-white font-semibold text-sm shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              Search
            </button>
          </motion.div>

          {/* Popular tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-4"
          >
            <span className="text-purple-300 text-xs font-medium">Popular:</span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  searchQuery === tag
                    ? "bg-white text-purple-700 border-white font-semibold"
                    : "text-purple-100 border-purple-400/40 hover:border-white hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORY PILLS — sticky, Fiverr-nav style ── */}
      <section className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeCategory === null ? "text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
              style={activeCategory === null ? { backgroundColor: BRAND } : {}}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === cat.slug ? "text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
                style={activeCategory === cat.slug ? { backgroundColor: BRAND } : {}}
              >
                <cat.icon size={13} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── JOB FEED (Upwork-style) ── */}
            <div className="lg:col-span-8">

              {/* Freelancer tabs */}
              {isFreelancer && (
                <div className="flex items-center gap-0 border-b border-slate-200 mb-0 bg-white rounded-t-xl px-4">
                  {(["recent", "best"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSortBy(key)}
                      className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                        sortBy === key
                          ? "border-purple-600 text-purple-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {key === "recent" ? "Most Recent" : (
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={13} /> Best Match
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="ml-auto py-3 flex items-center gap-2">
                    {sortBy === "best" && matches.length > 0 && (
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                        AI ranked
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {loading ? "" : `${filteredProjects.length} jobs`}
                    </span>
                  </div>
                </div>
              )}

              {/* Client header */}
              {isClient && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Open Projects</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {loading ? "" : `${filteredProjects.length} projects available`}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/projects/new"
                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg"
                    style={{ backgroundColor: BRAND }}
                  >
                    Post a Project <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* States */}
              {loading ? (
                <div className="flex justify-center py-20 bg-white rounded-xl border border-slate-200">
                  <Loader2 className="animate-spin" size={26} style={{ color: BRAND }} />
                </div>

              ) : sortBy === "best" && matchError === "MISSING_SKILLS" ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Complete your profile</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5">
                    Add skills to unlock AI-powered job matching tailored to your expertise.
                  </p>
                  <Link
                    href="/profile"
                    className="px-5 py-2.5 text-white rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: BRAND }}
                  >
                    Add Skills
                  </Link>
                </div>

              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">
                    {searchQuery ? "No projects match your search." : "No open projects right now. Check back soon!"}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs font-medium hover:underline"
                      style={{ color: BRAND }}
                    >
                      Clear search
                    </button>
                  )}
                </div>

              ) : (
                /* Upwork job card list */
                <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {filteredProjects.map((project, i) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.1) }}
                    >
                      <div
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="block px-6 py-5 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h3 className="font-semibold text-slate-800 text-base group-hover:text-purple-600 transition-colors line-clamp-1 mb-1">
                              {project.title}
                            </h3>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2.5">
                              {project.client?.profile?.name && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setProfilePanelUserId(project.client.id); }}
                                  className="flex items-center gap-1 font-medium text-slate-500 hover:text-[#6B4EFF] hover:underline transition-colors"
                                >
                                  <UserCircle2 size={11} />
                                  {project.client.profile.name}
                                </button>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {timeAgo(project.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={11} />
                                {project._count?.proposals ?? 0} proposals
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-3">
                              {project.description}
                            </p>

                            {/* Skills */}
                            {(project.skills?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {project.skills.slice(0, 5).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {project.skills.length > 5 && (
                                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full">
                                    +{project.skills.length - 5}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Budget + Match score */}
                          <div className="shrink-0 text-right space-y-2">
                            {sortBy === "best" && (project as any).matchScore > 0 && (
                              <div className="flex justify-end">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-black">
                                  <Sparkles size={10} />
                                  {Math.round((project as any).matchScore * 100)}% match
                                </span>
                              </div>
                            )}
                            {project.budgetMin != null || project.budgetMax != null ? (
                              <>
                                <p className="text-base font-bold text-slate-800 tabular-nums">
                                  ${(project.budgetMin ?? 0).toLocaleString()}
                                  {project.budgetMax && project.budgetMax !== project.budgetMin
                                    ? `–$${project.budgetMax.toLocaleString()}`
                                    : ""}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">Budget</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-slate-400">TBD</p>
                                <p className="text-xs text-slate-300 mt-0.5">Budget</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
                </div>
                <div className="p-3">
                  {isFreelancer ? (
                    <div className="space-y-1">
                      {[
                        { href: "/dashboard", icon: Briefcase, label: "My Dashboard", color: "bg-purple-50", iconColor: "text-purple-600" },
                        { href: "/profile", icon: UserCircle2, label: "Edit Profile", color: "bg-emerald-50", iconColor: "text-emerald-600" },
                        { href: "/proposals/me", icon: Send, label: "My Proposals", color: "bg-blue-50", iconColor: "text-blue-600" },
                        { href: "/contracts/me", icon: FileText, label: "My Contracts", color: "bg-amber-50", iconColor: "text-amber-600" },
                      ].map(({ href, icon: Icon, label, color, iconColor }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                              <Icon size={15} className={iconColor} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{label}</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {[
                        { href: "/dashboard/projects/new", icon: Zap, label: "Post a Project", color: "bg-purple-50", iconColor: "text-purple-600" },
                        { href: "/dashboard", icon: Briefcase, label: "My Projects", color: "bg-blue-50", iconColor: "text-blue-600" },
                        { href: "/contracts/me", icon: FileText, label: "Contracts", color: "bg-emerald-50", iconColor: "text-emerald-600" },
                      ].map(({ href, icon: Icon, label, color, iconColor }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                              <Icon size={15} className={iconColor} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{label}</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Stats */}
              {/* <div
                className="rounded-xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #3b1c7a 0%, #6b27d9 100%)" }}
              >
                <div className="px-5 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={15} className="text-purple-200" />
                    <span className="text-purple-100 text-xs font-semibold tracking-wide uppercase">Platform Stats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Open Projects", value: projects.length.toString() },
                      { label: "Freelancers", value: "500+" },
                      { label: "Jobs Done", value: "1.2k+" },
                      { label: "Countries", value: "30+" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/10 rounded-lg px-3 py-2.5">
                        <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
                        <p className="text-purple-200 text-xs mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div> */}

              {/* Upcoming Meetings */}
              {upcomingMeetings.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-violet-500" />
                      <h3 className="text-sm font-bold text-slate-800">Upcoming Calls</h3>
                    </div>
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{upcomingMeetings.length}</span>
                  </div>
                  <div className="p-3 space-y-1">
                    {upcomingMeetings.map((m) => (
                      <Link
                        key={m.id}
                        href={`/contracts/${m.contractId}`}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                          <CalendarDays size={13} className="text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(m.scheduledAt).toLocaleDateString()} at {new Date(m.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Browse by Category */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Browse by Category</h3>
                </div>
                <div className="p-3 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                        activeCategory === cat.slug ? "bg-purple-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${cat.bg}`}>
                          <cat.icon size={14} className={cat.color} />
                        </div>
                        <span className={`text-sm font-medium ${activeCategory === cat.slug ? "text-purple-700" : "text-slate-600"}`}>
                          {cat.name}
                        </span>
                      </div>
                      <ChevronRight
                        size={13}
                        className={`transition-colors ${activeCategory === cat.slug ? "text-purple-400" : "text-slate-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Client profile panel */}
      {profilePanelUserId && (
        <UserProfilePanel
          userId={profilePanelUserId}
          onClose={() => setProfilePanelUserId(null)}
        />
      )}
    </div>
  );
}