"use client";

import { Paperclip, Mic, Send, Play } from "lucide-react";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<"Activity" | "Meetings">("Activity");
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="bg-slate-800 dark:bg-slate-900 rounded-xl border border-slate-700 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab("Activity")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "Activity"
              ? "bg-purple-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("Meetings")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "Meetings"
              ? "bg-purple-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          Meetings
        </button>
      </div>
      <div className="mb-4">
        <div className="text-xs font-medium text-slate-400 mb-3">Today</div>
        <div className="space-y-4 flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {message.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">{message.sender}</span>
                  <span className="text-xs text-slate-400">{message.time}</span>
                </div>
                {message.type === "text" && (
                  <p className="text-slate-300 text-sm">{message.content}</p>
                )}
                {message.type === "video" && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 aspect-video">
                      <button className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="text-white ml-1" size={20} />
                        </div>
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm">{message.content}</p>
                  </div>
                )}
                {message.type === "audio" && (
                  <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-purple-500 rounded-full"
                          style={{ height: `${Math.random() * 20 + 8}px` }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">Audio message</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Mic size={18} />
          </button>
          <button className="p-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

