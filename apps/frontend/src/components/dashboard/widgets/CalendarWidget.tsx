"use client";

import { ChevronLeft, ChevronRight, CheckCircle2, Circle, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";

interface CalendarWidgetProps {
  events?: Array<{ date: string | Date; title: string }>;
}

export default function CalendarWidget({ events = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  
  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, currentMonthIdx, 1).getDay();
  // Adjust for Monday start (0: Sun -> 1: Mon, ..., 6: Sat -> 0: Sun)
  const firstDayIdx = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, currentMonthIdx + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(year, currentMonthIdx - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentMonthIdx + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter events for current visible month
  const visibleEventsByDay = useMemo(() => {
    const map: Record<number, Array<{ date: Date; title: string; intensity: 'extreme' | 'high' | 'medium' | 'low' }>> = {};
    
    events.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonthIdx && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        
        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let intensity: 'extreme' | 'high' | 'medium' | 'low' = 'low';
        if (diffDays <= 0) intensity = 'extreme';
        else if (diffDays <= 3) intensity = 'high';
        else if (diffDays <= 7) intensity = 'medium';

        map[day].push({ date: d, title: e.title, intensity });
      }
    });
    return map;
  }, [events, currentMonthIdx, year, today]);

  // Get upcoming events across all months (sorted)
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, today]);

  const todayDay = today.getDate();
  const isSelectedMonthToday = today.getMonth() === currentMonthIdx && today.getFullYear() === year;

  const getIntensityStyles = (intensity: string) => {
    switch(intensity) {
      case 'extreme': return "w-2.5 h-2.5 bg-rose-500 animate-pulse";
      case 'high': return "w-2 h-2 bg-brand-purple shadow-sm shadow-purple-200";
      case 'medium': return "w-1.5 h-1.5 bg-brand-purple/80";
      default: return "w-1 h-1 bg-brand-purple/50";
    }
  };

  return (
    <div className="bento-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg text-brand-purple">
            <CalendarDays size={18} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 font-display">Timeline</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-baseline gap-2">
          {month} <span className="text-slate-400 font-medium text-xs">{year}</span>
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayIdx)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
        {calendarDays.map((day) => {
          const isToday = isSelectedMonthToday && day === todayDay;
          const dayEvents = visibleEventsByDay[day] || [];
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all relative cursor-pointer group ${
                isToday
                  ? "bg-brand-purple text-white font-bold shadow-lg shadow-purple-200"
                  : hasEvents
                  ? "text-brand-purple font-semibold hover:bg-purple-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="relative z-10">{day}</span>
              {hasEvents && !isToday && (
                <div className="absolute bottom-1.5 flex items-center justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <span 
                      key={i} 
                      className={`rounded-full transition-all ${getIntensityStyles(e.intensity)}`}
                    ></span>
                  ))}
                </div>
              )}
              {hasEvents && (
                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg pointer-events-none whitespace-nowrap z-30 shadow-xl transition-opacity">
                  <div className="flex flex-col gap-1">
                    {dayEvents.map((e, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${e.intensity === 'extreme' ? 'bg-rose-500' : 'bg-brand-purple'}`}></span>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex-1 overflow-y-auto max-h-[300px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Milestone Overview</div>
          <div className="space-y-4">
            {upcomingEvents.slice(0, 5).map((e, idx) => {
              const date = new Date(e.date);
              const diffTime = date.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              let statusText = `Due in ${diffDays} days`;
              if (diffDays === 0) statusText = "Due TODAY";
              else if (diffDays < 0) statusText = `${Math.abs(diffDays)} days overdue`;

              return (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border transition-all ${
                    diffDays <= 0 
                      ? "bg-rose-50 border-rose-100 ring-4 ring-rose-50/50" 
                      : "bg-purple-50 border-purple-100 group-hover:bg-brand-purple group-hover:border-brand-purple"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase leading-none mb-0.5 ${
                      diffDays <= 0 ? "text-rose-400" : "text-slate-400 group-hover:text-purple-100"
                    }`}>
                      {date.toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className={`text-xs font-bold leading-none ${
                      diffDays <= 0 ? "text-rose-600" : "text-brand-purple group-hover:text-white"
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold truncate transition-colors ${
                      diffDays <= 0 ? "text-rose-600" : "text-slate-900 group-hover:text-brand-purple"
                    }`}>
                      {e.title}
                    </div>
                    <div className={`text-[10px] font-medium ${
                      diffDays <= 0 ? "text-rose-400" : "text-slate-400"
                    }`}>
                      {statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

