"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import {
  Users,
  Briefcase,
  MessageSquare,
  FileText,
  TrendingUp,
  UserCheck,
  UserX,
  LogOut,
  Shield,
  Activity,
  Eye,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  clients: number;
  freelancers: number;
  totalProjects: number;
  totalPosts: number;
  totalConversations: number;
  totalProposals: number;
};

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: any;
  stats: {
    projects: number;
    proposals: number;
    posts: number;
    conversations: number;
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "posts">("overview");

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    loadData();
  }, [token, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        get<Stats>("/admin/dashboard/stats", token),
        get<{ users: User[] }>("/admin/users?limit=10", token),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  if (!token || user?.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Welcome back, {user?.name || "Admin"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              change={`${stats.clients + stats.freelancers} active`}
            />
            <StatCard
              title="Clients"
              value={stats.clients}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Freelancers"
              value={stats.freelancers}
              icon={UserX}
              color="purple"
            />
            <StatCard
              title="Projects"
              value={stats.totalProjects}
              icon={Briefcase}
              color="orange"
            />
            <StatCard
              title="Posts"
              value={stats.totalPosts}
              icon={FileText}
              color="indigo"
            />
            <StatCard
              title="Conversations"
              value={stats.totalConversations}
              icon={MessageSquare}
              color="pink"
            />
            <StatCard
              title="Proposals"
              value={stats.totalProposals}
              icon={TrendingUp}
              color="teal"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "users", label: "Users", icon: Users },
                { id: "projects", label: "Projects", icon: Briefcase },
                { id: "posts", label: "Posts", icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Users</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                                  {u.profile?.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {u.profile?.name || "No name"}
                                </div>
                                <div className="text-sm text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                u.role === "CLIENT"
                                  ? "bg-green-100 text-green-800"
                                  : u.role === "FREELANCER"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex space-x-4">
                              <span>P: {u.stats.projects}</span>
                              <span>Po: {u.stats.posts}</span>
                              <span>C: {u.stats.conversations}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => router.push(`/admin/users/${u.id}`)}
                              className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <p className="text-slate-600">Users management coming soon...</p>
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <p className="text-slate-600">Projects management coming soon...</p>
              </div>
            )}

            {activeTab === "posts" && (
              <div>
                <p className="text-slate-600">Posts management coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  change?: string;
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    indigo: "bg-indigo-100 text-indigo-600",
    pink: "bg-pink-100 text-pink-600",
    teal: "bg-teal-100 text-teal-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          {change && <p className="text-xs text-slate-500 mt-1">{change}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

