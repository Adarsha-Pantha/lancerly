"use client";

import { Plus, Edit, Share, Filter, Tag, Users, FileText, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
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

export default function TodayTasksWidget({ tasks }: TodayTasksWidgetProps) {
  return (
    <div className="bento-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-brand-purple">Upcoming Milestones</h2>
          <div className="flex items-center -space-x-2">
            {tasks.slice(0, 3).map((task, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-brand-purple border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              >
                {task.teamMembers[0]?.name.charAt(0).toUpperCase() || "F"}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-brand-purple hover:bg-purple-50 rounded-xl transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Clock size={32} className="mb-2 opacity-20" />
          <p className="text-sm">No active milestones for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-purple-200 hover:shadow-soft transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-slate-900 font-semibold text-sm group-hover:text-brand-purple transition-colors">{task.title}</h3>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full font-medium",
                  task.progress === 100 ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-brand-purple"
                )}>
                  {task.progress === 100 ? "Ready to Approve" : "In Progress"}
                </span>
              </div>
              <p className="text-slate-500 text-xs mb-4 line-clamp-1">{task.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <FileText size={12} />
                    <span>{task.files}</span>
                  </div>
                </div>
                {task.progress === 100 ? (
                  <CheckCircle2 size={16} className="text-mint" />
                ) : (
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-purple rounded-full" 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

