"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Briefcase,
  MessageCircle,
} from "lucide-react";

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
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export default function ChatPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace(`/login?redirect=/messages/${conversationId}`);
    } else if (conversationId) {
      loadConversation();
    }
  }, [token, conversationId, router]);

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!token || !conversationId) return;

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");
    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      // Join the conversation room
      socket.emit('joinConversation', { conversationId });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('message', (newMessage: Message) => {
      // Add new message to conversation
      setConversation((prev) => {
        if (!prev) return prev;
        // Check if message already exists (avoid duplicates)
        // Also check by content and senderId to catch temp messages
        const exists = prev.messages.some(
          m => m.id === newMessage.id || 
          (m.content === newMessage.content && 
           m.senderId === newMessage.senderId && 
           Math.abs(new Date(m.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 2000)
        );
        if (exists) {
          return prev;
        }
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  async function loadConversation() {
    if (!token || !conversationId) return;
    try {
      setLoading(true);
      const data = await get<Conversation>(`/conversations/${conversationId}`, token);
      setConversation(data);
    } catch (err: any) {
      console.error("Failed to load conversation:", err);
      const msg = err?.message || "";
      const authErrors = ["Unauthorized", "token", "expired", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.toLowerCase().includes(p.toLowerCase()))) {
        logout();
        router.replace(`/login?redirect=/messages/${conversationId}`);
      } else if (msg.includes("not found") || msg.includes("Access denied")) {
        router.replace("/messages");
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageContent.trim() || !token || !conversationId || sending) return;

    const content = messageContent.trim();
    setMessageContent("");
    setSending(true);

    try {
      // Try WebSocket first if connected
      if (socketRef.current?.connected) {
        // Don't add optimistic message for WebSocket - it's fast enough
        socketRef.current.emit('sendMessage', {
          conversationId,
          content,
        });
        // Message will be added via WebSocket 'message' event
        setSending(false);
      } else {
        // Fallback to REST API - use optimistic update for slower REST
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content,
          senderId: user?.id || '',
          sender: {
            id: user?.id || '',
            name: user?.name || 'You',
            avatarUrl: user?.avatarUrl || null,
          },
          createdAt: new Date().toISOString(),
        };

        if (conversation) {
          setConversation({
            ...conversation,
            messages: [...conversation.messages, tempMessage],
          });
        }

        const newMessage = await post<Message>(
          `/conversations/${conversationId}/messages`,
          { content },
          token
        );

        // Replace temp message with real one
        if (conversation) {
          setConversation({
            ...conversation,
            messages: conversation.messages
              .filter(m => m.id !== tempMessage.id)
              .concat(newMessage),
          });
        }
        setSending(false);
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      alert(err?.message || "Failed to send message");
      setMessageContent(content); // Restore message on error
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent("User")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600">Conversation not found</p>
          <Link
            href="/messages"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
          <div className="p-4 flex items-center gap-4">
            <Link
              href="/messages"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <Link
              href={`/users/${conversation.participant.id}`}
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src={toPublicUrl(conversation.participant.avatarUrl) || fallbackAvatar}
                alt={conversation.participant.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200"
              />
            </Link>
            <div className="flex-1">
              <Link
                href={`/users/${conversation.participant.id}`}
                className="hover:text-purple-600 transition-colors"
              >
                <h2 className="font-semibold text-slate-900">
                  {conversation.participant.name}
                </h2>
              </Link>
              {conversation.project && (
                <Link
                  href={`/projects/${conversation.project.id}`}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600"
                >
                  <Briefcase size={12} />
                  <span>{conversation.project.title}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {conversation.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-600">No messages yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isOwn = message.senderId === user?.id;
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
                        <span className="text-xs text-slate-500 mb-1">
                          {message.sender.name}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
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

          {/* Message Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 p-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageContent.trim() || sending}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

