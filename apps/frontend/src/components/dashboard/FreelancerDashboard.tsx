"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { get } from "@/lib/api";
import ActiveProjectsWidget from "./widgets/ActiveProjectsWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TodayTasksWidget from "./widgets/TodayTasksWidget";
import ActivityWidget from "./widgets/ActivityWidget";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  DollarSign,
  Briefcase,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";

export default function FreelancerDashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [proposalCount, setProposalCount] = useState(0);
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) void loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [contractsData, notificationsData, conversationsData, statsData, stripeStatus, proposalsData] = await Promise.all([
        get<any[]>("/contracts/me?role=FREELANCER", token as string),
        get<any[]>("/notifications", token as string),
        get<any[]>("/conversations", token as string),
        get<any>("/contracts/stats?role=FREELANCER", token as string),
        get<any>("/stripe/connect/status", token as string).catch(() => null),
        get<any[]>("/proposals/me", token as string).catch(() => []),
      ]);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
      setStats(statsData);
      setProposalCount(Array.isArray(proposalsData) ? proposalsData.length : 0);
      setStripeConnected(stripeStatus?.chargesEnabled ?? false);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = useMemo(
    () =>
      contracts
        .filter((c: any) => c.status === "ACTIVE")
        .map((c: any) => {
          const total = c.milestones?.length || 0;
          const done =
            c.milestones?.filter((m: any) => m.status === "APPROVED" || m.status === "PAID").length || 0;
          return {
            id: c.project?.id || c.projectId,
            title: c.project?.title || "Untitled Project",
            clientName: c.client?.profile?.name || "Client",
            progress: total > 0 ? Math.floor((done / total) * 100) : 0,
            daysCompleted: Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000),
            totalDays: 30,
            status: c.status,
          };
        }),
    [contracts]
  );

  const upcomingMilestones = useMemo(() => {
    return contracts
      .flatMap((c) => (c.milestones || []).map((m: any) => ({ ...m, projectTitle: c.project?.title, client: c.client })))
      .filter((m: any) => m.status !== "PAID")
      .sort((a: any, b: any) => new Date(a.dueDate || a.createdAt).getTime() - new Date(b.dueDate || b.createdAt).getTime())
      .slice(0, 6)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        description: `${m.client?.profile?.name || "Client"} · ${m.projectTitle}`,
        tags: [String(m.status || "").replace(/_/g, " ")],
        progress: m.status === "COMPLETED" || m.status === "APPROVED" ? 100 : m.status === "IN_PROGRESS" ? 50 : 0,
        files: 0,
        completed: m.status === "COMPLETED" || m.status === "APPROVED" ? 1 : 0,
        total: 1,
        teamMembers: [{ name: m.client?.profile?.name || "C" }],
      }));
  }, [contracts]);

  const recentMessages = useMemo(
    () =>
      conversations.slice(0, 5).map((conv: any) => ({
        id: conv.id,
        sender: conv.participants?.find((p: any) => p.userId !== user?.id)?.user?.profile?.name || "User",
        content: conv.lastMessage?.content || "No messages yet",
        time: conv.lastMessage
          ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        type: "text" as const,
      })),
    [conversations, user]
  );

  const calendarEvents = useMemo(
    () => contracts.flatMap((c: any) => (c.milestones || []).map((m: any) => ({ date: m.dueDate || m.createdAt, title: m.title }))),
    [contracts]
  );

  if (!token || !user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalEarned = stats?.totalEarned || 0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="h-44 rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-50 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6">
            <div className="h-[340px] rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-[280px] rounded-2xl bg-slate-100 animate-pulse" />
          </div>
          <div className="md:col-span-5 space-y-6">
            <div className="h-[280px] rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-[260px] rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {stripeConnected === false && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Set up payouts to receive payments</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Connect your Stripe account so clients can pay you when milestones are approved.
              </p>
            </div>
          </div>
          <Link
            href="/settings?tab=payments"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-2xl transition-colors shadow-sm"
          >
            Set up <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_40px_-12px_rgba(109,40,217,0.18)]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-7 pt-8 pb-7">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-2">{greeting}</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{user?.name || "Freelancer"}</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
              {activeProjects.length > 0
                ? `You have ${activeProjects.length} active project${activeProjects.length > 1 ? "s" : ""} in progress.`
                : "You have no active projects yet. Browse jobs to get started!"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/home"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-[0_6px_20px_-4px_rgba(109,40,217,0.5)]"
            >
              <Search size={16} />
              Find Work
            </Link>
            <Link
              href="/contracts/me"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-violet-300 hover:bg-violet-50/40 transition-all"
            >
              <FileText size={16} />
              My Contracts
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-violet-300 hover:bg-violet-50/40 transition-all"
            >
              <MessageCircle size={16} />
              Messages
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
          {[
            { label: "Total earned", value: `$${totalEarned.toLocaleString()}`, color: "text-emerald-600" },
            { label: "Active now", value: stats?.active ?? 0, color: "text-violet-600" },
            { label: "Completed", value: stats?.completed ?? 0, color: "text-sky-600" },
            { label: "Proposals", value: proposalCount, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-6">
          <ActiveProjectsWidget projects={activeProjects} role="FREELANCER" />
          <TodayTasksWidget tasks={upcomingMilestones} />
          <ActivityWidget messages={recentMessages} />
        </div>

        <div className="md:col-span-5 space-y-6">
          <NotificationsWidget
            notifications={notifications.slice(0, 8).map((n: any) => ({
              id: n.id,
              type: "message",
              title: n.title,
              description: n.message,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }))}
            onClear={() => setNotifications([])}
          />
          <CalendarWidget events={calendarEvents} />

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-800">Quick actions</h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Browse jobs", href: "/home", icon: Search, color: "text-violet-700 bg-violet-50 border-violet-200" },
                { label: "View contracts", href: "/contracts/me", icon: FileText, color: "text-sky-700 bg-sky-50 border-sky-200" },
                { label: "My proposals", href: "/proposals", icon: TrendingUp, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { label: "Edit profile", href: "/profile", icon: LayoutDashboard, color: "text-amber-700 bg-amber-50 border-amber-200" },
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

