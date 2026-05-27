"use client";

import { Bell, MessageSquare, Briefcase, CheckCircle2, X, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

const typeConfig = {
  message:  { icon: MessageSquare,  bg: "bg-blue-100",    icon_c: "text-blue-600",    dot: "bg-blue-500"   },
  proposal: { icon: Briefcase,      bg: "bg-violet-100",  icon_c: "text-violet-600",  dot: "bg-violet-500" },
  project:  { icon: CheckCircle2,   bg: "bg-emerald-100", icon_c: "text-emerald-600", dot: "bg-emerald-500"},
  event:    { icon: Info,           bg: "bg-amber-100",   icon_c: "text-amber-600",   dot: "bg-amber-500"  },
};

export default function NotificationsWidget({ notifications, onClear }: NotificationsWidgetProps) {
  const [items, setItems] = useState(notifications);

  const dismiss = (id: string) => setItems(items.filter((n) => n.id !== id));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-blue-100 relative">
            <Bell className="size-4 text-blue-700" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {items.length > 9 ? "9+" : items.length}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Updates</h2>
            <p className="text-[11px] text-slate-400">{items.length} unread</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { setItems([]); onClear?.(); }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Bell className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No new notifications</p>
          </div>
        ) : (
          items.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.event;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
              >
                {/* Icon */}
                <div className={cn("p-2 rounded-xl shrink-0", cfg.bg)}>
                  <Icon className={cn("size-3.5", cfg.icon_c)} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-black text-slate-900 leading-snug">{n.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{n.description}</p>
                </div>

                {/* Dismiss */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-slate-200"
                >
                  <X className="size-3 text-slate-400" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
