"use client";

import { Download, ChevronDown, TrendingUp } from "lucide-react";

interface StatsWidgetProps {
  totalHours: string;
  data: Array<{ month: string; hours: number }>;
  selectedMonth?: string;
}

export default function StatsWidget({ totalHours, data, selectedMonth = "Last year" }: StatsWidgetProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Hours spent</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            <Download size={14} />
            Download
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            {selectedMonth}
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      <div className="mb-6">
        <div className="text-3xl font-bold text-white mb-1">{totalHours}</div>
        <div className="flex items-center gap-2 text-sm text-green-400">
          <TrendingUp size={14} />
          <span>+12% from last month</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-12 text-xs text-slate-400">{item.month}</div>
            <div className="flex-1 relative">
              <div className="h-6 bg-slate-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all ${
                    idx === 3
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${(item.hours / maxHours) * 100}%` }}
                ></div>
              </div>
              {idx === 3 && (
                <div className="absolute -top-8 left-0 bg-slate-700 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                  {item.month} {item.hours}h {Math.floor((item.hours % 1) * 60)}m
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

