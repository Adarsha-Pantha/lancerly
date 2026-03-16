"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { useNotifications } from "@/context/NotificationContext";
import {
  MessageCircle,
  Plus,
  Search,
  Loader2,
  User,
  Briefcase,
  Clock,
} from "lucide-react";

type Conversation = {
  id: string;
  projectId: string | null;
  project: {
    id: string;
    title: string;
  } | null;
  participant: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  hasUnread?: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function MessagesPage() {
  const { user, token, logout } = useAuth();
  const { notifications } = useNotifications();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<Conversation[]>("/conversations", token);
      setConversations(data);
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
      });
      const msg = err?.message || "";
      const authErrors = ["Unauthorized", "token", "expired", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.toLowerCase().includes(p.toLowerCase()))) {
        // Clear expired/invalid token
        logout();
        router.replace("/login?redirect=/messages");
      } else {
        // Show error to user
        alert(`Failed to load conversations: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    if (!token) {
      router.replace("/login?redirect=/messages");
    } else {
      loadConversations();
    }
  }, [token, router, loadConversations]);

  useEffect(() => {
    if (!token) return;
    const latest = notifications[0];
    if (!latest) return;
    if (latest.type === 'NEW_MESSAGE') {
      loadConversations();
    }
  }, [token, notifications, loadConversations]);

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.project?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("User")}`;

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
            <p className="text-slate-600">Chat with clients and freelancers</p>
          </div>
          <Link
            href="/friends"
            className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={24} />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600 mb-2">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              {!searchQuery && (
                <p className="text-sm text-slate-500">
                  Start a conversation from a project or profile
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-4 p-4 hover:bg-purple-50/50 transition-colors"
                >
                  <Link
                    href={`/users/${conv.participant.id}`}
                    className="relative flex-shrink-0 hover:opacity-80 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={toPublicUrl(conv.participant.avatarUrl) || fallbackAvatar}
                      alt={conv.participant.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-200"
                    />
                  </Link>
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {conv.hasUnread && (
                          <span className="inline-flex h-2 w-2 rounded-full bg-purple-600 flex-shrink-0" />
                        )}
                        <h3
                          className={`font-semibold truncate hover:text-purple-600 transition-colors ${
                            conv.hasUnread ? "text-slate-950" : "text-slate-900"
                          }`}
                        >
                        {conv.participant.name}
                        </h3>
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conv.project && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <Briefcase size={12} />
                        <span className="truncate">{conv.project.title}</span>
                      </div>
                    )}
                    {conv.lastMessage ? (
                      <p
                        className={`text-sm truncate ${
                          conv.hasUnread ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {conv.lastMessage.senderId === user?.id && (
                          <span className="text-slate-400">You: </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No messages yet</p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

