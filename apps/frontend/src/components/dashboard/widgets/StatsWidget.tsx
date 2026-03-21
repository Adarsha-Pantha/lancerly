"use client";

import { Download, ChevronDown, TrendingUp, DollarSign, Briefcase } from "lucide-react";

interface StatsWidgetProps {
  totalHours: string;
  data: Array<{ month: string; hours: number }>;
  selectedMonth?: string;
}

export default function StatsWidget({ totalHours, data, selectedMonth = "Spending & Status" }: StatsWidgetProps) {
  const maxVal = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div className="bento-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-brand-purple">Portfolio Overview</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-brand-purple hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
            <Download size={14} />
          </button>
          <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-brand-purple hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="text-xs text-brand-purple font-medium mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-slate-900">{totalHours}</div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="text-xs text-mint font-medium mb-1">Active Projects</div>
          <div className="text-2xl font-bold text-slate-900">{data.find(d => d.month === "Active")?.hours || 0}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-slate-700">Project Status Distribution</div>
        {data.map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{item.month}</span>
              <span className="text-slate-900 font-semibold">{item.hours}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.month === "Active" ? "bg-brand-purple" : 
                  item.month === "Done" ? "bg-mint" : "bg-slate-300"
                }`}
                style={{ width: `${(item.hours / maxVal) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

