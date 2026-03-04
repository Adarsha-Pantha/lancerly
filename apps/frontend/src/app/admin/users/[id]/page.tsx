"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get } from "@/lib/api";
import { ArrowLeft, User, Briefcase, FileText, MessageSquare, Clock } from "lucide-react";

type UserActivity = {
  user: any;
  activities: {
    projects: any[];
    posts: any[];
    proposals: any[];
    conversations: any[];
    logins: any[];
  };
};

export default function UserActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const userId = params.id as string;
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    loadActivity();
  }, [token, user, router, userId]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const data = await get<UserActivity>(`/admin/users/${userId}/activity`, token);
      setActivity(data);
    } catch (error) {
      console.error("Failed to load user activity:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || user?.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading user activity...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">User not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {activity.user.profile?.name?.[0]?.toUpperCase() || activity.user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activity.user.profile?.name || "No name"}
              </h1>
              <p className="text-slate-600">{activity.user.email}</p>
              <span
                className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  activity.user.role === "CLIENT"
                    ? "bg-green-100 text-green-800"
                    : activity.user.role === "FREELANCER"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {activity.user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects */}
          <ActivitySection
            title="Projects"
            icon={Briefcase}
            items={activity.activities.projects}
            renderItem={(item) => (
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.status}</p>
              </div>
            )}
          />

          {/* Posts */}
          <ActivitySection
            title="Posts"
            icon={FileText}
            items={activity.activities.posts}
            renderItem={(item) => (
              <div>
                <p className="font-medium text-slate-900">
                  {item.content?.substring(0, 50) || "No content"}...
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          />

          {/* Proposals */}
          <ActivitySection
            title="Proposals"
            icon={MessageSquare}
            items={activity.activities.proposals}
            renderItem={(item) => (
              <div>
                <p className="font-medium text-slate-900">{item.project?.title || "N/A"}</p>
                <p className="text-sm text-slate-500">Status: {item.status}</p>
              </div>
            )}
          />

          {/* Recent Logins */}
          <ActivitySection
            title="Recent Logins"
            icon={Clock}
            items={activity.activities.logins}
            renderItem={(item) => (
              <div>
                <p className="font-medium text-slate-900">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">IP: {item.ip || "N/A"}</p>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

function ActivitySection({
  title,
  icon: Icon,
  items,
  renderItem,
}: {
  title: string;
  icon: any;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">({items.length})</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No {title.toLowerCase()} found</p>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

