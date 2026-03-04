"use client";

import { useState, useEffect, useRef } from "react";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

type Message = {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: string;
};

type Conversation = {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  messages: Message[];
};

type ProjectChatProps = {
  conversationId: string;
  token: string;
  currentUserId: string;
  otherPartyName: string;
  otherPartyAvatar?: string | null;
  defaultExpanded?: boolean;
};

export default function ProjectChat({
  conversationId,
  token,
  currentUserId,
  otherPartyName,
  otherPartyAvatar,
  defaultExpanded = true,
}: ProjectChatProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token || !conversationId) return;
    loadConversation();
  }, [token, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function loadConversation() {
    if (!token || !conversationId) return;
    try {
      setLoading(true);
      const data = await get<Conversation>(`/conversations/${conversationId}`, token);
      setConversation(data);
    } catch {
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageContent.trim() || !token || sending) return;

    const content = messageContent.trim();
    setMessageContent("");
    setSending(true);

    try {
      const newMessage = await post<Message>(
        `/conversations/${conversationId}/messages`,
        { content },
        token
      );
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, newMessage],
        });
      }
    } catch {
      setMessageContent(content);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherPartyName)}`;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading your messages...</span>
        </div>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <MessageCircle size={20} className="text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
            <p className="text-sm text-slate-500">Chat with {otherPartyName}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-slate-500" />
        ) : (
          <ChevronDown size={20} className="text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-200 flex flex-col" style={{ minHeight: "320px", maxHeight: "420px" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
            {conversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle size={40} className="text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">No messages yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-[240px]">
                  Say hello, ask a question, or share an update about the project.
                </p>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isOwn = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {!isOwn && (
                      <img
                        src={toPublicUrl(message.sender.avatarUrl) || fallbackAvatar}
                        alt={message.sender.name}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                      {!isOwn && (
                        <span className="text-xs text-slate-500 mb-1">{message.sender.name}</span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageContent.trim() || sending}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
