"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import ActiveProjectsWidget from "./widgets/ActiveProjectsWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TodayTasksWidget from "./widgets/TodayTasksWidget";
import ActivityWidget from "./widgets/ActivityWidget";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Search, MessageCircle, FileText, Users, Zap } from "lucide-react";

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) void loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [contractsData, notificationsData, conversationsData, statsData] = await Promise.all([
        get<any[]>("/contracts/me?role=CLIENT", token || undefined),
        get<any[]>("/notifications", token || undefined),
        get<any[]>("/conversations", token || undefined),
        get<any>("/contracts/stats?role=CLIENT", token || undefined),
      ]);
      setContracts(contractsData || []);
      setNotifications(notificationsData || []);
      setConversations(conversationsData || []);
      setStats(statsData || null);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) return null;

  const activeProjects = contracts
    .filter((c: any) => c.status === "ACTIVE")
    .map((c: any) => {
      const total = c.milestones?.length || 0;
      const done = c.milestones?.filter((m: any) => m.status === "APPROVED" || m.status === "PAID").length || 0;
      return {
        id: c.project.id,
        title: c.project.title,
        freelancerName: c.freelancer?.profile?.name || "Freelancer",
        progress: total > 0 ? Math.floor((done / total) * 100) : 0,
        daysCompleted: Math.floor((Date.now() - new Date(c.startDate).getTime()) / 86400000),
        totalDays: c.endDate ? Math.floor((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86400000) : 30,
        status: c.status,
      };
    });

  const todayTasks = contracts
    .flatMap((c: any) => (c.milestones || []).map((m: any) => ({ ...m, projectTitle: c.project.title, freelancer: c.freelancer })))
    .filter((m: any) => m.status !== "PAID")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 6)
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      description: `Project: ${m.projectTitle}`,
      tags: [String(m.status || "").replace(/_/g, " ")],
      progress: m.status === "COMPLETED" || m.status === "APPROVED" ? 100 : m.status === "IN_PROGRESS" ? 50 : 0,
      files: m._count?.deliveries || 0,
      completed: m.status === "COMPLETED" || m.status === "APPROVED" ? 1 : 0,
      total: 1,
      teamMembers: m.freelancer?.profile ? [{ name: m.freelancer.profile.name, avatar: m.freelancer.profile.avatarUrl }] : [],
    }));

  const calendarEvents = contracts.flatMap((c: any) =>
    (c.milestones || []).map((m: any) => ({
      date: m.dueDate || m.createdAt,
      title: `${m.title} (${c.project.title})`,
    }))
  );

  const recentMessages = conversations.slice(0, 5).map((conv: any) => {
    const lastMsg = conv.messages?.[conv.messages.length - 1];
    return {
      id: conv.id,
      sender: conv.freelancer?.profile?.name || "Freelancer",
      content: lastMsg?.content || "No messages yet",
      time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
      type: "text" as const,
    };
  });

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalSpent = stats?.totalSpent ? `$${stats.totalSpent.toLocaleString()}` : "$0";

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="h-44 rounded-3xl bg-gradient-to-br from-cyan-100 to-teal-50 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="h-[340px] rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-[280px] rounded-2xl bg-slate-100 animate-pulse" />
          </div>
          <div className="md:col-span-4 space-y-6">
            <div className="h-[280px] rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-[260px] rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_40px_-12px_rgba(14,116,144,0.18)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-7 pt-8 pb-7">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">{greeting}</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{user?.name}</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              {activeProjects.length > 0
                ? `${activeProjects.length} project${activeProjects.length > 1 ? "s" : ""} currently in progress.`
                : "No active projects yet. Post a project to find great freelancers."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-[0_6px_20px_-4px_rgba(14,116,144,0.5)]"
            >
              <Plus size={16} />
              Post a Project
            </Link>
            <Link
              href="/dashboard/browse"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-teal-300 hover:bg-teal-50/40 transition-all"
            >
              <Search size={16} />
              Find Talent
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-teal-300 hover:bg-teal-50/40 transition-all"
            >
              <MessageCircle size={16} />
              Messages
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
          {[
            { label: "Total spent", value: totalSpent, color: "text-emerald-600" },
            { label: "Active projects", value: stats?.active ?? activeProjects.length, color: "text-cyan-600" },
            { label: "Completed", value: stats?.completed ?? 0, color: "text-teal-600" },
            { label: "Total contracts", value: stats?.total ?? contracts.length, color: "text-violet-600" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <ActiveProjectsWidget projects={activeProjects} role="CLIENT" />
          <TodayTasksWidget tasks={todayTasks} />
          <ActivityWidget messages={recentMessages} />
        </div>

        <div className="md:col-span-4 space-y-6">
          <NotificationsWidget
            notifications={notifications.slice(0, 6).map((n: any) => ({
              id: n.id,
              type: "event",
              title: String(n.type || "").replace(/_/g, " "),
              description: n.message,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              date: new Date(n.createdAt).toLocaleDateString(),
            }))}
            onClear={() => setNotifications([])}
          />
          <CalendarWidget events={calendarEvents} />

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-teal-500" />
                <h3 className="text-sm font-semibold text-slate-800">Quick actions</h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Post project", href: "/dashboard/projects/new", icon: Plus, color: "text-teal-700 bg-teal-50 border-teal-200" },
                { label: "Find talent", href: "/dashboard/browse", icon: Users, color: "text-sky-700 bg-sky-50 border-sky-200" },
                { label: "My contracts", href: "/contracts/me", icon: FileText, color: "text-violet-700 bg-violet-50 border-violet-200" },
                { label: "Edit profile", href: "/profile", icon: FileText, color: "text-amber-700 bg-amber-50 border-amber-200" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-bold transition-all hover:shadow-sm hover:-translate-y-0.5",
                    a.color
                  )}
                >
                  <a.icon className="size-4 shrink-0" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

