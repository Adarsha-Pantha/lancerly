"use client";

import { Bell, Trash2, Edit, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
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
      case "event":
        return <Bell size={16} className="text-blue-400" />;
      case "message":
        return <MessageSquare size={16} className="text-green-400" />;
      case "proposal":
        return <Briefcase size={16} className="text-purple-400" />;
      case "project":
        return <CheckCircle2 size={16} className="text-yellow-400" />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Notifications</h2>
        <button
          onClick={onClear}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-4">
        {localNotifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          localNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-medium text-sm">{notification.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs mb-2">{notification.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {notification.date && <span>{notification.date}</span>}
                    {notification.time && <span>{notification.time}</span>}
                    {notification.duration && <span>Duration: {notification.duration}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

