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
  Check,
  CheckCheck,
  Paperclip,
  File,
  Download,
  X,
} from "lucide-react";
import { postForm, patch } from "@/lib/api";
import { ModerationError } from "@/components/ui/ModerationError";

type Message = {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  attachmentUrl?: string | null;
  attachmentName?: string | null;
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
    isOnline: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (conversation?.messages && conversation.messages.length > 0) {
      const hasUnread = conversation.messages.some(m => m.senderId !== user?.id && !m.isRead);
      if (hasUnread) {
        markAsRead();
      }
    }
  }, [conversation?.messages]);

  async function markAsRead() {
    if (!token || !conversationId) return;
    try {
      await patch(`/conversations/${conversationId}/read`, {}, token);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

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
    if ((!messageContent.trim() && !attachedFile) || !token || !conversationId || sending || uploading) return;

    const content = messageContent.trim();
    const fileToUpload = attachedFile;
    
    setMessageContent("");
    setAttachedFile(null);
    setSending(true);

    try {
      setError(null);
      let attachmentUrl = null;
      let attachmentName = null;

      if (fileToUpload) {
        setUploading(true);
        const fd = new FormData();
        fd.append("document", fileToUpload);
        const uploadRes = await postForm<{ attachmentUrl: string; attachmentName: string }>(
          "/settings/document",
          fd,
          token
        );
        attachmentUrl = uploadRes.attachmentUrl;
        attachmentName = uploadRes.attachmentName;
        setUploading(false);
      }

      // Try WebSocket first if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('sendMessage', {
          conversationId,
          content: content || (attachmentName ? `Sent an attachment: ${attachmentName}` : ""),
          attachmentUrl,
          attachmentName
        });
        setSending(false);
      } else {
        // Fallback to REST API
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content: content || (attachmentName ? `Sent an attachment: ${attachmentName}` : ""),
          attachmentUrl,
          attachmentName,
          senderId: user?.id || '',
          sender: {
            id: user?.id || '',
            name: user?.name || 'You',
            avatarUrl: user?.avatarUrl || null,
          },
          isRead: false,
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
          { 
            content: content || (attachmentName ? `Sent an attachment: ${attachmentName}` : ""),
            attachmentUrl,
            attachmentName
          },
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
      setError(err?.message || "Failed to send message");
      setMessageContent(content); 
      setAttachedFile(fileToUpload);
      setMessageContent(content); // Restore message on error
      setSending(false);
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit");
        return;
      }
      setAttachedFile(file);
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
              <div className="flex items-center gap-2">
                <Link
                  href={`/users/${conversation.participant.id}`}
                  className="hover:text-purple-600 transition-colors"
                >
                  <h2 className="font-semibold text-slate-900">
                    {conversation.participant.name}
                  </h2>
                </Link>
                {conversation.participant.isOnline && (
                  <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
                )}
              </div>
              {conversation.project ? (
                <Link
                  href={`/projects/${conversation.project.id}`}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600"
                >
                  <Briefcase size={12} />
                  <span>{conversation.project.title}</span>
                </Link>
              ) : (
                <p className="text-xs text-slate-500">
                  {conversation.participant.isOnline ? "Online" : "Offline"}
                </p>
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
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        {message.attachmentUrl && (
                          <div className={`mt-2 p-3 rounded-lg flex items-center gap-3 border ${
                            isOwn ? "bg-white/10 border-white/20" : "bg-white border-slate-200"
                          }`}>
                            <div className={`p-2 rounded-lg ${isOwn ? "bg-white/20" : "bg-slate-100"}`}>
                              <File size={20} className={isOwn ? "text-white" : "text-slate-600"} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isOwn ? "text-white" : "text-slate-900"}`}>
                                {message.attachmentName || "Attached file"}
                              </p>
                            </div>
                            <a
                              href={toPublicUrl(message.attachmentUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-full transition-colors ${
                                isOwn ? "hover:bg-white/20 text-white" : "hover:bg-slate-200 text-slate-600"
                              }`}
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <div className="flex items-center">
                            {message.isRead ? (
                              <CheckCheck size={14} className="text-purple-500" />
                            ) : conversation.participant.isOnline ? (
                              <CheckCheck size={14} className="text-slate-400" />
                            ) : (
                              <Check size={14} className="text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pt-4">
            <ModerationError message={error || undefined} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 p-4"
          >
            {attachedFile && (
              <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-white rounded border border-slate-100">
                    <File size={16} className="text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {attachedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploading}
                className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={attachedFile ? "Add a caption..." : "Type a message..."}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={sending || uploading}
              />
              <button
                type="submit"
                disabled={(!messageContent.trim() && !attachedFile) || sending || uploading}
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

