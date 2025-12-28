"use client";

import { Plus, Edit, Share, Filter, Tag, Users, FileText } from "lucide-react";
import { useState } from "react";

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
  const [filterCount] = useState(8);

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Today tasks</h2>
          <div className="flex items-center -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-semibold"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <button className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-600 transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            <Edit size={14} />
            Edit
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            <Share size={14} />
            Share
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            <Filter size={14} />
            Filter
            <span className="ml-1 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded">{filterCount}</span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-white font-medium">{task.title}</h3>
              <div className="flex items-center gap-1">
                {task.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-purple-600/20 text-purple-300 rounded flex items-center gap-1"
                  >
                    <Tag size={10} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-3">{task.description}</p>
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span className="text-white font-medium">{task.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  <span>{task.files} files</span>
                </div>
                <span>{task.completed}/{task.total}</span>
              </div>
              <div className="flex items-center -space-x-2">
                {task.teamMembers.slice(0, 3).map((member, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-semibold"
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {task.teamMembers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center text-slate-300 text-xs">
                    +{task.teamMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

