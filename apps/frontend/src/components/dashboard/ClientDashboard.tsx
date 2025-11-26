"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  FileText,
  MessageSquare,
  Bell,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { get } from "@/lib/api";
import AnimatedButton from "@/components/ui/AnimatedButton";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

type ProjectStats = {
  total: number;
  active: number;
  completed: number;
  pending: number;
};

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const loadStats = async () => {
    try {
      // Fetch project stats from backend
      const projects = await get<any[]>("/projects/mine", token);
      const total = projects.length;
      const active = projects.filter((p: any) => p.status === "OPEN" || p.status === "IN_PROGRESS").length;
      const completed = projects.filter((p: any) => p.status === "COMPLETED").length;
      const pending = projects.filter((p: any) => p.status === "PENDING").length;
      setStats({ total, active, completed, pending });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <Plus className="h-6 w-6" />,
      title: "Post New Project",
      desc: "Create a new project and find talented freelancers",
      link: "/projects/new",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "My Projects",
      desc: "View and manage all your posted projects",
      link: "/projects/mine",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Browse Freelancers",
      desc: "Discover talented freelancers for your projects",
      link: "/explore",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Messages",
      desc: "Communicate with freelancers",
      link: "/messages",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
    },
  ];

  const statCards = [
    {
      label: "Total Projects",
      value: stats.total,
      icon: <Briefcase className="text-blue-600 dark:text-blue-400" size={24} />,
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Projects",
      value: stats.active,
      icon: <Clock className="text-purple-600 dark:text-purple-400" size={24} />,
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />,
      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />,
      color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 dark:from-slate-900 dark:via-blue-950/10 dark:to-purple-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Hero Section */}
        <section className="relative mb-12 h-[60vh] rounded-3xl overflow-hidden shadow-glow animate-slideUp">
          <AnimatedShaderBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 flex flex-col items-center justify-center text-center px-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-6 text-white">
              <Briefcase className="text-white" size={18} />
              <span className="text-sm font-semibold tracking-wide">Client Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
              Welcome back, <span className="text-blue-200">{user?.name || "Client"}</span> 👋
            </h1>
            <p className="text-lg md:text-xl text-slate-100 max-w-3xl mb-6">
              Manage your projects, find talented freelancers, and grow your business.
            </p>
            <AnimatedButton
              variant="primary"
              size="lg"
              icon={<Plus size={18} />}
              onClick={() => router.push("/projects/new")}
            >
              Post New Project
            </AnimatedButton>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} rounded-lg border p-6 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                {stat.icon}
                {loading && (
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                )}
              </div>
              <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                {loading ? "..." : stat.value}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${action.bgColor} dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group`}
                onClick={() => router.push(action.link)}
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Recent Activity</h2>
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Bell className="mx-auto mb-4 text-slate-400" size={48} />
            <p>No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
}

