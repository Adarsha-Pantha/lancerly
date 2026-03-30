"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { get } from "@/lib/api";
import ActiveProjectsWidget from "./widgets/ActiveProjectsWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TodayTasksWidget from "./widgets/TodayTasksWidget";
import StatsWidget from "./widgets/StatsWidget";
import ActivityWidget from "./widgets/ActivityWidget";
import { Skeleton } from "@/components/ui/skeleton";

export default function FreelancerDashboard() {
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
    setLoading(true);
    try {
      const [contractsData, notificationsData, conversationsData, statsData] = await Promise.all([
        get<any[]>("/contracts/me?role=FREELANCER", token as string),
        get<any[]>("/notifications", token as string),
        get<any[]>("/conversations", token as string),
        get<any>("/contracts/stats?role=FREELANCER", token as string),
      ]);

      setContracts(contractsData || []);
      setNotifications(notificationsData || []);
      setConversations(conversationsData || []);
      setStats(statsData);
      
      console.log("[FRONTEND] Contracts Received:", JSON.stringify(contractsData, null, 2));
      console.log("[FRONTEND] Milestones Found in Contracts:", 
        contractsData?.map((c: any) => ({ 
          id: c.id, 
          mCount: c.milestones?.length || 0,
          mTitles: c.milestones?.map((m: any) => m.title) 
        }))
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform contracts for ActiveProjectsWidget
  const activeProjects = useMemo(() => 
    contracts
      .filter((c: any) => c.status === "ACTIVE")
      .map((c: any) => {
        const totalMilestones = c.milestones?.length || 0;
        const completedMilestones = c.milestones?.filter((m: any) => 
          m.status === 'APPROVED' || m.status === 'PAID'
        ).length || 0;
        
        return {
          id: c.project?.id || c.projectId,
          title: c.project?.title || "Untitled Project",
          clientName: c.client?.profile?.name || "Client",
          progress: totalMilestones > 0 
            ? Math.floor((completedMilestones / totalMilestones) * 100)
            : 0,
          daysCompleted: Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          totalDays: 30, 
          status: c.status,
        };
      })
  , [contracts]);

  // Transform milestones for TodayTasksWidget
  const upcomingMilestones = useMemo(() => {
    const allMilestones = contracts.flatMap(c => 
      (c.milestones || []).map((m: any) => ({ 
        ...m, 
        projectTitle: c.project?.title, 
        client: c.client 
      }))
    );
    
    return allMilestones
      .filter(m => m.status !== 'PAID') 
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.createdAt).getTime();
        const dateB = new Date(b.dueDate || b.createdAt).getTime();
        return dateA - dateB;
      })
      .slice(0, 6)
      .map(m => ({
        id: m.id,
        title: m.title,
        description: `Client: ${m.client?.profile?.name || 'Client'} • ${m.projectTitle}`,
        tags: [m.status.replace(/_/g, " ")],
        progress: (m.status === 'COMPLETED' || m.status === 'APPROVED') ? 100 : (m.status === 'IN_PROGRESS' ? 50 : 0),
        files: 0,
        completed: (m.status === 'COMPLETED' || m.status === 'APPROVED') ? 1 : 0,
        total: 1,
        teamMembers: [{ name: m.client?.profile?.name || "C" }],
      }));
  }, [contracts]);

  console.log("Upcoming Milestones (Processed):", upcomingMilestones);

  // Transform messages for ActivityWidget
  const recentMessages = useMemo(() => 
    conversations.slice(0, 5).map((conv: any) => ({
      id: conv.id,
      sender: conv.participants?.find((p: any) => p.userId !== user?.id)?.user?.profile?.name || "User",
      content: conv.lastMessage?.content || "No messages yet",
      time: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      type: "text" as const,
    }))
  , [conversations, user]);

  // Transform milestones for CalendarWidget
  const calendarEvents = useMemo(() => {
    return contracts.flatMap(c => 
      (c.milestones || [])
        .map((m: any) => ({
          date: m.dueDate || m.createdAt,
          title: m.title
        }))
    );
  }, [contracts]);

  // Transform stats for StatsWidget
  const dashboardStats = useMemo(() => {
    const totalEarned = stats?.totalSpent || 0; 
    return {
      totalHours: `$${(totalEarned / 100).toLocaleString()}`,
      data: [
        { month: "Active", hours: stats?.activeCount || 0 },
        { month: "Done", hours: stats?.completedCount || 0 },
        { month: "Proposed", hours: stats?.proposedCount || 0 },
      ]
    };
  }, [stats]);

  if (!token || !user) return null;

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <Skeleton className="h-10 w-64 mb-3" />
          <Skeleton className="h-4 w-96" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-[400px] rounded-3xl" />
          <Skeleton className="h-[350px] rounded-3xl" />
          <Skeleton className="h-[350px] rounded-3xl" />
          <Skeleton className="h-[350px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in mt-[-20px] slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 font-display">
            Freelancer <span className="text-brand-purple">Workspace</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your contracts, track earnings, and collaborate with clients.
          </p>
        </div>
      </header>

      {/* Main Bento Grid - 12 cols */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8">

        {/* ── LEFT COLUMN (col 1-5): Active Projects then Upcoming Milestones ── */}
        <div className="md:col-span-6
         space-y-6">
          {/* Row 1 left: Active Projects */}
          <ActiveProjectsWidget projects={activeProjects} role="FREELANCER" />
          {/* Row 2 left: Upcoming Milestones */}
          <TodayTasksWidget tasks={upcomingMilestones} />
        </div>

        {/* ── MIDDLE COLUMN (col 6-9): Calendar spans rows 1+2 ── */}
        <div className="md:col-span-3">
          <CalendarWidget events={calendarEvents} />
        </div>

        {/* ── RIGHT COLUMN (col 10-12): Updates spans rows 1+2 ── */}
        <div className="md:col-span-3">
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
        </div>

        {/* ── ROW 3: Recent Chat (7 cols) + Portfolio/Stats (5 cols) ── */}
        <div className="md:col-span-7">
          <ActivityWidget messages={recentMessages} />
        </div>

        <div className="md:col-span-5">
          <StatsWidget
            totalHours={dashboardStats.totalHours}
            data={dashboardStats.data}
          />
        </div>

      </div>
    </div>
  );
}
