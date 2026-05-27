"use client";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/lib/url";
import type { FeedComment, FeedPost } from "./types";
import { Heart, MessageCircle, Trash2, Send, Image as ImageIcon } from "lucide-react";

export function FeedPostCard({
  post,
  index,
  currentUserId,
  token,
  fallbackAvatar,
  formatTime,
  isImage,
  isOwnPost,
  onLike,
  onDelete,
  onToggleComments,
  commentsOpen = false,
  expanded,
  comments,
  commentValue = "",
  commentInput,
  onCommentChange,
  onAddComment,
  onSubmitComment,
  commentLoading,
  className,
}: {
  post: FeedPost;
  index?: number;
  currentUserId?: string;
  token?: string;
  fallbackAvatar?: string;
  formatTime?: (dateString: string) => string;
  isImage?: (url: string) => boolean;
  isOwnPost: boolean;
  onLike: () => void;
  onDelete: () => void;
  onToggleComments: () => void;
  commentsOpen?: boolean;
  expanded?: boolean;
  comments: FeedComment[] | undefined;
  commentValue?: string;
  commentInput?: string;
  onCommentChange: (v: string) => void;
  onAddComment?: () => void;
  onSubmitComment?: () => Promise<void> | void;
  commentLoading?: boolean;
  className?: string;
}) {
  const authorName = post.author?.profile?.name || post.author?.email || "User";
  const avatar =
    toPublicUrl(post.author?.profile?.avatarUrl) ||
    fallbackAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;

  const open = expanded ?? commentsOpen;
  const commentText = commentInput ?? commentValue;

  return (
    <article className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden", className)}>
      <div className={cn("h-1.5", isOwnPost ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-violet-500 to-fuchsia-500")} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={authorName} className="size-10 rounded-2xl border border-slate-200 object-cover" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 truncate">{authorName}</p>
                {post.author?.role && post.author.role !== "ADMIN" && (
                  <span className={cn(
                    "shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                    post.author.role === "FREELANCER"
                      ? "text-violet-700 bg-violet-50 border-violet-200"
                      : "text-sky-700 bg-sky-50 border-sky-200"
                  )}>
                    {post.author.role === "FREELANCER" ? "Freelancer" : "Client"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {formatTime
                  ? formatTime(post.createdAt)
                  : new Date(post.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {isOwnPost && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              aria-label="Delete post"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        {/* Content */}
        {post.content && <p className="mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>}

        {/* Media */}
        {post.mediaUrls?.length > 0 && (
          <div className={cn("mt-4 grid gap-3", post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {post.mediaUrls.slice(0, 4).map((url, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={toPublicUrl(url)} alt="" className="w-full h-44 object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={onLike}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-xs font-semibold transition-all",
              post.isLiked ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            <Heart className={cn("size-4", post.isLiked && "fill-rose-500 text-rose-600")} />
            {post._count?.likes ?? 0}
          </button>

          <button
            type="button"
            onClick={onToggleComments}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <MessageCircle className="size-4" />
            {post._count?.comments ?? 0}
          </button>

          {(post.mediaUrls?.length ?? 0) > 0 && (
            <div className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-wider inline-flex items-center gap-1.5">
              <ImageIcon className="size-3.5" />
              {post.mediaUrls.length} media
            </div>
          )}
        </div>

        {/* Comments */}
            {open && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {(comments ?? []).length === 0 ? (
                <p className="text-xs text-slate-500">No comments yet.</p>
              ) : (
                (comments ?? []).map((c) => {
                  const n = c.author?.profile?.name || "User";
                  return (
                    <div key={c.id} className="rounded-2xl bg-white border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">{n}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                    value={commentText}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              />
              <button
                type="button"
                    onClick={() => (onSubmitComment ? onSubmitComment() : onAddComment ? onAddComment() : undefined)}
                disabled={commentLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                <Send className="size-4" />
                {commentLoading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

