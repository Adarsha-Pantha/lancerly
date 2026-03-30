"use client";

import { useState, useEffect, useRef } from "react";
import { get, post, patch, postForm } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, Check, CheckCheck, Paperclip, File, Download, X } from "lucide-react";
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
  participant: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isOnline: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token || !conversationId) return;
    loadConversation();
  }, [token, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (expanded && conversation?.messages && conversation.messages.length > 0) {
      const hasUnread = conversation.messages.some(m => m.senderId !== currentUserId && !m.isRead);
      if (hasUnread) {
        markAsRead();
      }
    }
  }, [conversation?.messages, expanded]);

  async function markAsRead() {
    if (!token || !conversationId) return;
    try {
      await patch(`/conversations/${conversationId}/read`, {}, token);
      // We don't necessarily need to reload here as the UI will update on next fetch or socket event
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
    } catch {
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!messageContent.trim() && !attachedFile) || !token || sending || uploading) return;

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

      const newMessage = await post<Message>(
        `/conversations/${conversationId}/messages`,
        { 
          content: content || (attachmentName ? `Sent an attachment: ${attachmentName}` : ""),
          attachmentUrl,
          attachmentName
        },
        token
      );
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, newMessage],
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setMessageContent(content);
      setAttachedFile(fileToUpload);
    } finally {
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
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
              {conversation.participant.isOnline && (
                <span className="flex h-2 w-2 rounded-full bg-green-500" title="Online" />
              )}
            </div>
            <p className="text-sm text-slate-500">
              Chat with {otherPartyName} {conversation.participant.isOnline ? "(Online)" : "(Offline)"}
            </p>
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
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
                              <CheckCheck size={14} className="text-purple-600" />
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
 
          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 bg-slate-50">
            {attachedFile && (
              <div className="mb-3 p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-slate-100 rounded">
                    <File size={16} className="text-slate-600" />
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
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
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
                className="p-2.5 text-slate-500 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={attachedFile ? "Add a caption..." : "Type your message..."}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                disabled={sending || uploading}
              />
              <button
                type="submit"
                disabled={(!messageContent.trim() && !attachedFile) || sending || uploading}
                className="p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2 text-sm font-medium"
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
