"use client";

import { CheckCircle2, Clock, ListTodo, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  progress: number;
  files: number;
  completed: number;
  total: number;
  teamMembers: Array<{ name: string; avatar?: string }>;
};

interface TodayTasksWidgetProps {
  tasks: Task[];
}

function statusConfig(progress: number) {
  if (progress === 100) return {
    label: "Done",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
  };
  if (progress >= 50) return {
    label: "In progress",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
    bar: "bg-violet-500",
  };
  return {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-400",
  };
}

export default function TodayTasksWidget({ tasks }: TodayTasksWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100">
            <ListTodo className="size-4 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Upcoming Milestones</h2>
            <p className="text-[11px] text-slate-400">{tasks.length} pending</p>
          </div>
        </div>
        {/* avatar stack */}
        {tasks.length > 0 && (
          <div className="flex items-center -space-x-2">
            {tasks.slice(0, 4).map((task, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              >
                {task.teamMembers[0]?.name.charAt(0).toUpperCase() || "?"}
              </div>
            ))}
            {tasks.length > 4 && (
              <div className="size-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                +{tasks.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="p-5">
        {tasks.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Clock className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No active milestones</p>
            <p className="text-xs text-slate-400 mt-1">Milestones will appear here when contracts are active</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-violet-200 via-amber-200 to-emerald-200" />
            <div className="space-y-3">
              {tasks.map((task) => {
                const sc = statusConfig(task.progress);
                return (
                  <div key={task.id} className="relative flex gap-4 group">
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-3.5 shrink-0">
                      <div className={cn("size-[10px] rounded-full border-2 border-white shadow", sc.dot)} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 hover:border-violet-200 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-black text-slate-900 leading-snug">{task.title}</h3>
                        <span className={cn("shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full", sc.badge)}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 truncate">{task.description}</p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", sc.bar)}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 tabular-nums shrink-0">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
