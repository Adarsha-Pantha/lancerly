"use client";

import { CalendarDays, Video, Plus, Clock } from "lucide-react";

export type MeetingItem = {
  id: string;
  title: string;
  when: string; // ISO or display
  link?: string | null;
  status?: "scheduled" | "completed" | "cancelled";
};

export function MeetingsTab({
  // Some pages pass these (contract workspace)
  contractId,
  token,
  // Optional direct data injection
  meetings = [],
  onCreate,
}: {
  contractId?: string;
  token?: string;
  meetings?: MeetingItem[];
  onCreate?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-sky-100">
            <CalendarDays className="size-4 text-sky-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Meetings</h3>
            <p className="text-[11px] text-slate-400">{meetings.length} scheduled</p>
          </div>
        </div>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-xs font-black text-white hover:bg-sky-700 transition-colors"
          >
            <Plus className="size-4" />
            New meeting
          </button>
        )}
      </div>

      <div className="p-5">
        {(contractId || token) && (
          <p className="text-[11px] text-slate-400 mb-3">
            Contract: <span className="font-semibold">{contractId || "—"}</span>
          </p>
        )}
        {meetings.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Video className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No meetings yet</p>
            <p className="text-xs text-slate-400 mt-1">Schedule a call to align on delivery</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-4 rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-sm transition-all bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <Clock className="size-3" />
                      <span className="truncate">{m.when}</span>
                    </div>
                  </div>
                  {m.link && (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 inline-flex items-center gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <Video className="size-4" />
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

