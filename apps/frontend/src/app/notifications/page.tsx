"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/lib/api";
import {
  Bell,
  Loader2,
  Check,
  CheckCheck,
  MessageCircle,
  Briefcase,
  FileText,
  DollarSign,
  Users,
  AlertCircle,
  Info,
} from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
};

const BRAND = "#6B4EFF";

function NotifIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  if (type?.includes("MESSAGE"))   return <MessageCircle size={15} className={cls} />;
  if (type?.includes("CONTRACT"))  return <FileText size={15} className={cls} />;
  if (type?.includes("PROJECT"))   return <Briefcase size={15} className={cls} />;
  if (type?.includes("PAYMENT"))   return <DollarSign size={15} className={cls} />;
  if (type?.includes("FRIEND"))    return <Users size={15} className={cls} />;
  if (type?.includes("DISPUTE"))   return <AlertCircle size={15} className={cls} />;
  return <Info size={15} className={cls} />;
}

function typeColor(type: string) {
  if (type?.includes("MESSAGE"))  return "bg-blue-50 text-blue-600";
  if (type?.includes("CONTRACT")) return "bg-emerald-50 text-emerald-600";
  if (type?.includes("PROJECT"))  return "bg-purple-50 text-purple-600";
  if (type?.includes("PAYMENT"))  return "bg-amber-50 text-amber-600";
  if (type?.includes("FRIEND"))   return "bg-pink-50 text-pink-600";
  if (type?.includes("DISPUTE"))  return "bg-red-50 text-red-500";
  return "bg-slate-100 text-slate-500";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!token) return;
    get<Notification[]>("/notifications", token)
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function markAll() {
    if (!token || markingAll) return;
    setMarkingAll(true);
    try {
      await post("/notifications/read-all", {}, token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
    setMarkingAll(false);
  }

  async function markOne(id: string) {
    if (!token) return;
    try {
      await post(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell size={22} style={{ color: BRAND }} />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAll}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-60"
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={26} style={{ color: BRAND }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell size={28} className="text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">All caught up!</h3>
            <p className="text-slate-400 text-sm">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`relative bg-white rounded-2xl border transition-colors ${
                  n.isRead ? "border-slate-100" : "border-purple-200 shadow-sm"
                }`}
              >
                {!n.isRead && (
                  <span
                    className="absolute top-4 left-4 w-2 h-2 rounded-full"
                    style={{ backgroundColor: BRAND }}
                  />
                )}
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className={`mt-0.5 p-2 rounded-xl ${typeColor(n.type)}`}>
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-slate-700" : "text-slate-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markOne(n.id)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors mt-0.5"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
