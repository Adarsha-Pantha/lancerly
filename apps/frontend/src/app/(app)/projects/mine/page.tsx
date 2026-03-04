"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { get, del, patch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowRight, 
  Folder, 
  Loader2, 
  RefreshCcw, 
  Paperclip, 
  Plus, 
  Archive, 
  Trash2, 
  DollarSign, 
  Users, 
  Tag,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Clock,
  Calendar,
  Briefcase,
  Play,
  CheckCircle,
  Pause,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { toPublicUrl } from "@/lib/url";
import AnimatedButton from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { motion } from "framer-motion";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  skills: string[];
  createdAt: string;
  attachments?: string[];
  projectType?: "CLIENT_REQUEST" | "FREELANCER_SHOWCASE";
  _count?: { proposals: number };
};

export default function MyProjectsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasProjects = projects.length > 0;

  useEffect(() => {
    if (!token) {
      router.replace("/login?redirect=/projects/mine");
      return;
    }
    void load();
  }, [token]);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get<Project[]>("/projects/me", token);
      setProjects(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function archive(id: string) {
    if (!token) return;
    try {
      await patch(`/projects/${id}/archive`, undefined, token);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to archive project");
    }
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await del(`/projects/${id}`, token);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete project");
    }
  }

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [projects],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return sorted.filter((project: Project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sorted, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-slate-100 text-slate-700";
      case "open": return "bg-emerald-100 text-emerald-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-purple-100 text-purple-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Edit size={16} />;
      case "open": return <Play size={16} />;
      case "in_progress": return <Clock size={16} />;
      case "completed": return <CheckCircle size={16} />;
      case "cancelled": return <Pause size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === "open" || p.status === "in_progress");
    const completedProjects = projects.filter(p => p.status === "completed");
    const totalBudget = projects.reduce((sum, p) => sum + ((p.budgetMax || 0)), 0);

    return {
      total: projects.length,
      active: activeProjects.length,
      completed: completedProjects.length,
      totalBudget
    };
  }, [projects]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header */}
        <div className="mb-10 animate-slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                <Folder className="text-purple-600" size={16} />
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Projects</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">My Projects</h1>
              <p className="text-slate-600 text-lg">
                Track the jobs you've opened, monitor proposals, and keep statuses up to date.
              </p>
            </div>
            <AnimatedButton
              variant="primary"
              size="lg"
              icon={<Plus size={18} />}
              onClick={() => router.push("/projects/new")}
            >
              Create Project
            </AnimatedButton>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slideUp" style={{ animationDelay: "0.1s" }}>
          <div className="glass-effect rounded-xl shadow-soft p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Folder className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                <p className="text-xs text-slate-600 font-medium">Total Projects</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl shadow-soft p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {projects.reduce((sum, p) => sum + (p._count?.proposals || 0), 0)}
                </p>
                <p className="text-xs text-slate-600 font-medium">Total Proposals</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl shadow-soft p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Tag className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {projects.filter(p => p.status === "OPEN").length}
                </p>
                <p className="text-xs text-slate-600 font-medium">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="glass-effect rounded-2xl shadow-soft overflow-hidden animate-slideUp" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <div className="flex items-center gap-3">
              <Folder className="text-purple-600" size={20} />
              <span className="font-bold text-slate-900">
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all hover:scale-105"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
                <p className="text-slate-600 font-medium">Loading projects…</p>
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block rounded-xl border-2 border-red-200 bg-red-50 px-6 py-4 text-red-700">
                {error}
              </div>
            </div>
          ) : !hasProjects ? (
            <div className="px-6 py-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Folder className="text-purple-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-8">Share your first idea and start receiving proposals.</p>
                <AnimatedButton
                  variant="primary"
                  size="lg"
                  icon={<Plus size={18} />}
                  onClick={() => router.push("/projects/new")}
                >
                  Post a Project
                </AnimatedButton>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sorted.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onArchive={() => archive(project.id)}
                  onDelete={() => remove(project.id)}
                  delay={`${index * 0.05}s`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onArchive,
  onDelete,
  delay,
}: {
  project: Project;
  onArchive: () => void;
  onDelete: () => void;
  delay: string;
}) {
  return (
    <div
      className="px-6 py-6 hover:bg-slate-50/50 transition-all animate-slideUp"
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
            <StatusBadge status={project.status} />
            {project.projectType && (
              <TypeBadge type={project.projectType} />
            )}
          </div>
          <p className="text-slate-700 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-1.5">
              <DollarSign size={16} />
              <span className="font-semibold">{budgetLabel(project)}</span>
            </div>
            {project._count?.proposals !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users size={16} />
                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="font-semibold hover:text-purple-600 underline"
                >
                  {project._count.proposals} proposals
                </button>
              </div>
            )}
          </div>

          {project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {project.attachments && project.attachments.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {project.attachments.map((asset) => (
                <AttachmentChip key={asset} url={asset} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:flex-col lg:items-end">
          <AnimatedButton
            variant="outline"
            size="sm"
            icon={<Archive size={16} />}
            onClick={onArchive}
          >
            Archive
          </AnimatedButton>
          <AnimatedButton
            variant="danger"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={onDelete}
          >
            Delete
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    OPEN: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    IN_PROGRESS: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    COMPLETED: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    CANCELLED: "bg-slate-200 text-slate-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status as keyof typeof styles] || "bg-slate-100 text-slate-700"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function TypeBadge({ type }: { type: "CLIENT_REQUEST" | "FREELANCER_SHOWCASE" }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        type === "FREELANCER_SHOWCASE"
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          : "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
      }`}
    >
      {type === "FREELANCER_SHOWCASE" ? "Showcase" : "Client Brief"}
    </span>
  );
}

function AttachmentChip({ url }: { url: string }) {
  const publicUrl = toPublicUrl(url);
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(publicUrl);
  const label = decodeURIComponent(publicUrl.split("/").pop() || "asset");

  if (isImage) {
    return (
      <a
        href={publicUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-20 w-24 flex-col overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md hover:scale-105"
      >
        <img src={publicUrl} alt={label} className="h-full w-full object-cover" />
      </a>
    );
  }

  return (
    <a
      href={publicUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all hover:scale-105"
    >
      <Paperclip size={14} />
      <span className="max-w-[130px] truncate">{label}</span>
    </a>
  );
}

function budgetLabel(project: Project) {
  if (project.budgetMin && project.budgetMax) {
    return `$${project.budgetMin}–$${project.budgetMax}`;
  }
  if (project.budgetMin) return `From $${project.budgetMin}`;
  if (project.budgetMax) return `Up to $${project.budgetMax}`;
  return "Budget TBD";
}
