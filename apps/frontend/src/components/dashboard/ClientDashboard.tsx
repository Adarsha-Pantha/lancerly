"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import ActiveProjectsWidget from "./widgets/ActiveProjectsWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TodayTasksWidget from "./widgets/TodayTasksWidget";
import StatsWidget from "./widgets/StatsWidget";
import ActivityWidget from "./widgets/ActivityWidget";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
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

      console.log("Client Dashboard Raw Contracts:", contractsData);

      setContracts(contractsData || []);
      setNotifications(notificationsData || []);
      setConversations(conversationsData || []);
      setStats(statsData || null);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) return null;

  if (loading) {
    return (
      <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Transform contracts for ActiveProjectsWidget
  const activeProjects = contracts
    .filter((c: any) => c.status === "ACTIVE")
    .map((c: any) => {
      const totalMilestones = c.milestones?.length || 0;
      const completedMilestones = c.milestones?.filter((m: any) => 
        m.status === "APPROVED" || m.status === "PAID"
      ).length || 0;

      return {
        id: c.project.id,
        title: c.project.title,
        freelancerName: c.freelancer?.profile?.name || "Freelancer",
        progress: totalMilestones > 0 
          ? Math.floor((completedMilestones / totalMilestones) * 100)
          : 0,
        daysCompleted: Math.floor((Date.now() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        totalDays: c.endDate 
          ? Math.floor((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24))
          : 30, 
        status: c.status,
      };
    });

  // Transform milestones for TodayTasksWidget
  const todayTasks = contracts
    .flatMap((c: any) => (c.milestones || []).map((m: any) => ({ ...m, projectTitle: c.project.title, freelancer: c.freelancer })))
    .filter((m: any) => m.status !== "PAID")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 4)
    .map((m: any) => ({
      id: m.id,
      title: m.title,
      description: `Project: ${m.projectTitle}`,
      tags: [m.status.replace(/_/g, " ")],
      progress: (m.status === "COMPLETED" || m.status === "APPROVED") ? 100 : (m.status === "IN_PROGRESS" ? 50 : 0),
      files: m._count?.deliveries || 0,
      completed: (m.status === "COMPLETED" || m.status === "APPROVED") ? 1 : 0,
      total: 1,
      teamMembers: m.freelancer?.profile ? [{ name: m.freelancer.profile.name, avatar: m.freelancer.profile.avatarUrl }] : [],
    }));

  const calendarEvents = contracts.flatMap((c: any) => 
    (c.milestones || [])
      .map((m: any) => ({
        date: m.dueDate || m.createdAt,
        title: `${m.title} (${c.project.title})`
      }))
  );

  // Stats data mapping
  const displayStats = {
    totalSpent: stats?.totalSpent ? `$${stats.totalSpent.toLocaleString()}` : "$0",
    activeContracts: stats?.active || 0,
    completedContracts: stats?.completed || 0,
  };

  // Chat messages transformation
  const recentMessages = conversations.slice(0, 3).map((conv: any) => {
    const lastMsg = conv.messages?.[conv.messages.length - 1];
    return {
      id: conv.id,
      sender: conv.freelancer?.profile?.name || "Freelancer",
      content: lastMsg?.content || "No messages yet",
      time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
      type: "text" as const,
    };
  });

  return (
    <div className="max-w-7xl max-h-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-slate-500">Here's what's happening with your projects today.</p>
        </div>
        <Link
          href="/contracts/me"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-100 hover:shadow-sm transition-all"
        >
          <Briefcase size={16} />
          <span className="text-sm font-medium">Contracts</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-1 space-y-6">
          {/* Calendar */}
          <div className="h-2xl">
            <CalendarWidget events={calendarEvents} />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <ActiveProjectsWidget projects={activeProjects} role="CLIENT" />

          {/* Today Tasks / Milestones */}
          <TodayTasksWidget tasks={todayTasks} />

          {/* Recent Activity / Chat */}  
          <div className="h-2xl">
            <ActivityWidget messages={recentMessages} />
          </div>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="space-y-6">
          {/* Stats Widget */}
          <StatsWidget 
            totalHours={displayStats.totalSpent} 
            data={[
              { month: "Active", hours: stats?.active || 0 },
              { month: "Done", hours: stats?.completed || 0 },
              { month: "Total", hours: stats?.total || 0 }
            ]} 
            selectedMonth="Spending & Status"
          />

          {/* Notifications */}
          <NotificationsWidget
            notifications={notifications.slice(0, 5).map(n => ({
              id: n.id,
              type: "event",
              title: n.type.replace(/_/g, " "),
              description: n.message,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(n.createdAt).toLocaleDateString(),
            }))}
            onClear={() => setNotifications([])}
          />
        </div>
      </div>
    </div>
  );
}