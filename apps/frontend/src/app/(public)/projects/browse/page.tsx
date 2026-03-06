"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowLeft, Clock, DollarSign, Users, MapPin, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";

/** API shape from GET /projects */
interface ApiProject {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  skills: string[];
  status: string;
  createdAt: string;
  projectType?: string;
  client: {
    id: string;
    profile: { name: string; avatarUrl?: string | null } | null;
  };
  _count: { proposals: number };
}

/** Display card shape */
interface ProjectCard {
  id: string;
  title: string;
  description: string;
  budgetLabel: string;
  clientName: string;
  proposals: number;
  status: string;
  postedAt: string;
  projectType: string;
  skills: string[];
}

export default function PublicProjectsBrowsePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch only projects that clients are offering (for freelancers) — exclude freelancer showcase
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("status", "OPEN");
        params.set("type", "CLIENT_REQUEST");
        const list = await get<ApiProject[]>(`/projects?${params.toString()}`);
        if (cancelled) return;
        const raw = Array.isArray(list) ? list : [];
        const mapped: ProjectCard[] = raw.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          budgetLabel:
            p.budgetMin != null || p.budgetMax != null
              ? `$${(p.budgetMin ?? 0).toLocaleString()} - $${(p.budgetMax ?? p.budgetMin ?? 0).toLocaleString()}`
              : "Budget not set",
          clientName: p.client?.profile?.name ?? "Client",
          proposals: p._count?.proposals ?? 0,
          status: p.status,
          postedAt: p.createdAt,
          projectType: p.projectType ?? "CLIENT_REQUEST",
          skills: p.skills ?? [],
        }));
        setProjects(mapped);
      } catch (e) {
        if (!cancelled) setError("Failed to load projects.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleProjectClick = (projectId: string) => {
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/projects/${projectId}`)}`);
    } else {
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-mint/5">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Link 
              href="/landing"
              className="inline-flex items-center gap-2 text-slate-blue hover:text-mint transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-blue mb-6"
            >
              Browse Projects
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-blue/70 max-w-3xl mx-auto leading-relaxed"
            >
              Discover exciting projects from top clients. Find work that matches your skills and interests.
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-4 items-center justify-center"
          >
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-blue/60" size={20} />
              <input
                type="text"
                placeholder="Search projects by title, description, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-blue placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white"
                suppressHydrationWarning
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-slate-200 rounded-xl text-slate-blue hover:bg-slate-50 transition-colors bg-white"
              >
                <Filter size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <p className="text-slate-blue/70">
              Showing <span className="font-semibold text-slate-blue">{filteredProjects.length}</span> projects from clients
            </p>
            {token ? (
              <Link
                href="/dashboard/projects/mine"
                className="text-mint hover:text-mint/80 font-medium transition-colors"
              >
                View My Projects →
              </Link>
            ) : (
              <div className="text-slate-blue/70 text-sm">
                <Link href="/login" className="text-mint hover:text-mint/80 font-medium">
                  Login
                </Link>
                {" "}to submit proposals
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
                >
                  <div className="h-5 bg-slate-200 rounded mb-3 w-3/4" />
                  <div className="h-4 bg-slate-100 rounded mb-2" />
                  <div className="h-4 bg-slate-100 rounded mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50/50 rounded-xl border border-red-100">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-mint text-white rounded-lg hover:opacity-90"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-mint/20 transition-all duration-200 cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-blue mb-2 line-clamp-2 hover:text-mint transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-blue/60 text-sm line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-blue/70">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      <span className="font-medium text-slate-blue">{project.budgetLabel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{project.proposals} proposals</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-mint/10 text-mint text-xs font-medium rounded-full">
                      {project.status}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-blue text-xs font-medium rounded-full">
                      {project.projectType === "CLIENT_REQUEST" ? "Client project" : project.projectType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-blue/60 mb-4">
                    <span className="font-medium text-slate-blue">{project.clientName}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(project.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-slate-50 text-slate-blue text-xs rounded-full border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="px-2 py-1 bg-slate-50 text-slate-blue text-xs rounded-full border border-slate-200">
                        +{project.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-mint font-medium text-sm">
                    View project
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-slate-blue/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-blue mb-2">No projects found</h3>
              <p className="text-slate-blue/70">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-mint to-mint/80 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of freelancers who are already finding great projects on Lancerly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-mint font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/hire"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mint transition-colors"
              >
                Post a Project
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
