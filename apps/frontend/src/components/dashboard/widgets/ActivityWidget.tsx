"use client";

import { Send, MessageSquare, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  type: "text" | "video" | "audio";
  videoUrl?: string;
};

interface ActivityWidgetProps {
  messages: Message[];
}

export default function ActivityWidget({ messages }: ActivityWidgetProps) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="bento-card p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-purple" />
          <h2 className="text-xl font-semibold text-slate-900">Recent Chats</h2>
        </div>
        <button className="p-2 text-slate-400 hover:text-brand-purple hover:bg-purple-50 rounded-xl transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <MessageSquare size={48} className="mb-4" />
            <p>No active conversations</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/messages?id=${message.id}`)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                {message.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-900 font-semibold text-sm group-hover:text-brand-purple transition-colors">
                    {message.sender}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{message.time}</span>
                </div>
                <p className="text-slate-500 text-xs truncate leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

