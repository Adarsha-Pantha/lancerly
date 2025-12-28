"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import DashboardLayout from "./DashboardLayout";
import ActiveProjectsWidget from "./widgets/ActiveProjectsWidget";
import NotificationsWidget from "./widgets/NotificationsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import TodayTasksWidget from "./widgets/TodayTasksWidget";
import StatsWidget from "./widgets/StatsWidget";
import ActivityWidget from "./widgets/ActivityWidget";

export default function FreelancerDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      // Load projects
      const projectsData = await get<any[]>("/projects/mine", token);
      setProjects(projectsData || []);

      // Generate notifications
      const projectNotifications = projectsData
        .filter((p: any) => p.status === "OPEN" || p.status === "IN_PROGRESS")
        .slice(0, 3)
        .map((p: any, idx: number) => ({
          id: `notif-${idx}`,
          type: idx === 0 ? ("proposal" as const) : ("message" as const),
          title: idx === 0 ? "New proposal received" : "Message from client",
          description: idx === 0
            ? `Proposal for ${p.title}`
            : `Message from ${p.clientId} about ${p.title}`,
          time: "2h ago",
        }));

      setNotifications(projectNotifications);

      // Generate sample messages
      setMessages([
        {
          id: "1",
          sender: "Sarah",
          content: "Hi! I am just getting organized for the week ahead",
          time: "11:30",
          type: "text" as const,
        },
        {
          id: "2",
          sender: "John",
          content: "Tips for effective design workflow",
          time: "11:34",
          type: "video" as const,
        },
        {
          id: "3",
          sender: "Emma",
          content: "",
          time: "11:35",
          type: "audio" as const,
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !user) return null;

  // Transform projects for ActiveProjectsWidget
  const activeProjects = projects
    .filter((p: any) => p.status === "OPEN" || p.status === "IN_PROGRESS")
    .slice(0, 4)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      clientName: "Client", // TODO: Get from project
      progress: Math.floor(Math.random() * 50 + 50),
      daysCompleted: Math.floor(Math.random() * 20 + 5),
      totalDays: Math.floor(Math.random() * 30 + 20),
      status: p.status,
    }));

  // Transform projects for TodayTasksWidget
  const todayTasks = projects
    .filter((p: any) => p.status === "IN_PROGRESS")
    .slice(0, 3)
    .map((p: any, idx: number) => ({
      id: p.id,
      title: p.title,
      description: p.description.substring(0, 80) + "...",
      tags: p.skills?.slice(0, 2) || ["Development", "Design"],
      progress: Math.floor(Math.random() * 80 + 10),
      files: Math.floor(Math.random() * 20 + 3),
      completed: Math.floor(Math.random() * 30 + 5),
      total: 34,
      teamMembers: [
        { name: "Alex" },
        { name: "Sam" },
        { name: "Jordan" },
      ],
    }));

  // Stats data
  const statsData = [
    { month: "Jan", hours: 120 },
    { month: "Feb", hours: 145 },
    { month: "Mar", hours: 132 },
    { month: "Apr", hours: 168 },
    { month: "May", hours: 155 },
    { month: "Jun", hours: 142 },
    { month: "Jul", hours: 178 },
    { month: "Aug", hours: 165 },
    { month: "Sep", hours: 189 },
  ];

  return (
    <DashboardLayout role="FREELANCER">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <ActiveProjectsWidget projects={activeProjects} role="FREELANCER" />

          {/* Today Tasks */}
          <TodayTasksWidget tasks={todayTasks} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <NotificationsWidget
            notifications={notifications}
            onClear={() => setNotifications([])}
          />

          {/* Calendar */}
          <CalendarWidget
            events={[
              { date: 6, title: "Project Review" },
              { date: 10, title: "Client Meeting" },
              { date: 18, title: "Deadline" },
              { date: 31, title: "Monthly Report" },
            ]}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Stats */}
        <StatsWidget totalHours="1,234 h 30 min" data={statsData} />

        {/* Activity/Team Chat */}
        <div className="lg:col-span-2">
          <ActivityWidget messages={messages} />
        </div>
      </div>
    </DashboardLayout>
  );
}
