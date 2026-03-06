"use client";

import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

interface CalendarWidgetProps {
  events?: Array<{ date: number; title: string }>;
}

export default function CalendarWidget({ events = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const currentMonth = currentDate.getMonth();

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const hasEvent = (day: number) => {
    return events.some((e) => e.date === day);
  };

  const tasks = [
    { id: 1, text: "Finish the report for the client meeting", completed: true },
    { id: 2, text: "Review the budget for the upcoming quarter", completed: false },
  ];

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>Year</option>
          </select>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-4">{month}</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay === 0 ? 6 : firstDay - 1)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
          {calendarDays.map((day) => {
            const isToday = day === today && currentDate.getMonth() === new Date().getMonth();
            const event = hasEvent(day);
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                  isToday
                    ? "bg-purple-600 text-white font-semibold"
                    : event
                    ? "text-white hover:bg-slate-700 cursor-pointer"
                    : "text-slate-300 hover:bg-slate-700 cursor-pointer"
                } transition-colors relative`}
              >
                {day}
                {event && !isToday && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-slate-700 pt-4 space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            {task.completed ? (
              <CheckCircle2 size={16} className="text-green-400" />
            ) : (
              <Circle size={16} className="text-slate-400" />
            )}
            <span className={task.completed ? "text-slate-400 line-through" : "text-white"}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

