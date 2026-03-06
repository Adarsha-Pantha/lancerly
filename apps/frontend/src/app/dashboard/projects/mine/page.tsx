"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Plus,
  Loader2,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  Search,
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

export default function MyProjectsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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

  const statusColors: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-slate-100 text-slate-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-slate-600 mt-1">Manage and track your posted projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <Plus size={18} />
            Post New Project
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search your projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-accent" size={40} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Post your first project to get proposals from talented freelancers.</p>
            <Link href="/dashboard/projects/new">
              <Button className="gap-2">
                <Plus size={18} />
                Post a Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-6 rounded-xl border border-slate-200 hover:border-accent/30 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 truncate">{project.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {project.budgetMin != null || project.budgetMax != null
                          ? `$${project.budgetMin ?? 0} - $${project.budgetMax ?? project.budgetMin ?? 0}`
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
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.skills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[project.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {project.status}
                    </span>
                    <ArrowRight size={18} className="text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
