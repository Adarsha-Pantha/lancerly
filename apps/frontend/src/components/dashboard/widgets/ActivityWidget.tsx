"use client";

import { MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  type: "text" | "video" | "audio";
};

interface ActivityWidgetProps {
  messages: Message[];
}

const AVATAR_COLORS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

export default function ActivityWidget({ messages }: ActivityWidgetProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-100">
            <MessageSquare className="size-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Chats</h2>
            <p className="text-[11px] text-slate-400">{messages.length} conversation{messages.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/messages")}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Open inbox <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {messages.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center bg-slate-50 m-5 rounded-2xl border border-dashed border-slate-200">
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <MessageSquare className="size-5 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">Messages from clients & freelancers appear here</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              onClick={() => router.push(`/messages/${msg.id}`)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 cursor-pointer transition-colors group"
            >
              {/* Avatar */}
              <div className={cn(
                "size-10 shrink-0 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-sm bg-gradient-to-br",
                AVATAR_COLORS[idx % AVATAR_COLORS.length]
              )}>
                {msg.sender.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{msg.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{msg.content}</p>
              </div>

              {/* Unread dot (decorative) */}
              <div className="size-2 rounded-full bg-violet-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </div>

      {messages.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-50">
          <button
            onClick={() => router.push("/messages")}
            className="w-full py-2.5 rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/40 transition-all"
          >
            View all messages
          </button>
        </div>
      )}
    </div>
  );
}
