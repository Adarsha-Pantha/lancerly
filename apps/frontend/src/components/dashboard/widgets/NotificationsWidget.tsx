"use client";

import { Bell, Trash2, Edit, MessageSquare, Briefcase, CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  type: "event" | "message" | "proposal" | "project";
  title: string;
  description: string;
  time: string;
  date?: string;
  duration?: string;
};

interface NotificationsWidgetProps {
  notifications: Notification[];
  onClear?: () => void;
}

export default function NotificationsWidget({ notifications, onClear }: NotificationsWidgetProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleDelete = (id: string) => {
    setLocalNotifications(localNotifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare size={14} className="text-emerald-500" />;
      case "proposal":
        return <Briefcase size={14} className="text-brand-purple" />;
      case "project":
        return <CheckCircle2 size={14} className="text-amber-500" />;
      default:
        return <Bell size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="bento-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-brand-purple">Updates</h2>
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-400 hover:text-brand-purple transition-colors"
        >
          Mark all as read
        </button>
      </div>
      <div className="space-y-3">
        {localNotifications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Bell className="mx-auto mb-3 opacity-20" size={32} />
            <p className="text-sm">Stay tuned for updates!</p>
          </div>
        ) : (
          localNotifications.map((notification) => (
            <div
              key={notification.id}
              className="group relative flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className="text-slate-900 font-semibold text-xs truncate uppercase tracking-tight">
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{notification.time}</span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-1 leading-relaxed">{notification.description}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

