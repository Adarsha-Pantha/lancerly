"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get, postForm, del, post } from "@/lib/api";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { FeedDiscoverPanel } from "@/components/feed/FeedDiscoverPanel";
import { FeedComposer } from "@/components/feed/FeedComposer";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import type { FeedPost, FeedComment } from "@/components/feed/types";

function normalizePost(p: FeedPost): FeedPost {
  return {
    ...p,
    _count: {
      likes: p._count?.likes ?? 0,
      comments: p._count?.comments ?? 0,
    },
  };
}

function greetingLine(name: string | null | undefined): string {
  const h = new Date().getHours();
  const piece =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Happy late night";
  return name ? `${piece}, ${name.split(" ")[0]}` : piece;
}

export default function FeedPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?redirect=/feed");
      return;
    }
    loadFeed();
  }, [token, authLoading, router]);

  async function loadFeed(showRefreshUi = false) {
    if (!token) return;
    try {
      if (showRefreshUi) setRefreshing(true);
      else setLoading(true);
      const data = await get<FeedPost[]>("/feed", token);
      setPosts(data.map(normalizePost));
    } catch (err: unknown) {
      console.error("Failed to load feed:", err);
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "";
      const authErrors = ["Unauthorized", "token", "expired", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.toLowerCase().includes(p.toLowerCase()))) {
        logout();
        router.replace("/login?redirect=/feed");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        alert(`${file.name} is not an image or video`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 10));

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        const url = URL.createObjectURL(file);
        setPreviews((prev) => [...prev, url]);
      }
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      router.push("/login?redirect=/feed");
      return;
    }
    if (!content.trim() && selectedFiles.length === 0) {
      alert("Please add some content or media");
      return;
    }

    try {
      setPosting(true);
      const formData = new FormData();
      if (content.trim()) {
        formData.append("content", content.trim());
      }
      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      await postForm("/feed", formData, token);
      setContent("");
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadFeed();
    } catch (err: unknown) {
      console.error("Post creation error:", err);
      const errorMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as Error).message)
          : "Failed to create post. Please check your connection and try again.";
      alert(errorMsg);
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!token) {
      router.push("/login?redirect=/feed");
      return;
    }
    try {
      await post(`/feed/${postId}/like`, {}, token);
      await loadFeed();
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post?")) return;
    if (!token) return;
    try {
      await del(`/feed/${postId}`, token);
      await loadFeed();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to delete post";
      alert(msg);
    }
  }

  async function toggleComments(postId: string) {
    const isOpen = expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && !comments[postId] && token) {
      try {
        const data = await get<FeedComment[]>(`/feed/${postId}/comments`, token);
        setComments((prev) => ({ ...prev, [postId]: data }));
      } catch {
        /* ignore */
      }
    }
  }

  async function handleAddComment(postId: string) {
    const text = commentInputs[postId]?.trim();
    if (!text || !token) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const newComment = await post<FeedComment>(`/feed/${postId}/comments`, { content: text }, token);
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), newComment] }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p
        )
      );
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to add comment";
      alert(msg);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  }

  function isImage(url: string) {
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || url.startsWith("data:image");
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  }

  const fallbackAvatar = useMemo(
    () => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`,
    [user?.name]
  );

  if (authLoading || !token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-600 mx-auto mb-4" size={40} />
          <p className="text-muted-foreground">{authLoading ? "Loading…" : "Redirecting to login…"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="relative border-b border-border/80 bg-gradient-to-b from-violet-50/50 via-background to-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, hsl(258 68% 54% / 0.2), transparent),
              radial-gradient(ellipse 60% 40% at 100% 0%, hsl(35 80% 60% / 0.12), transparent)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="animate-slideUp">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Community feed
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {greetingLine(user?.name)}
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground text-base sm:text-lg leading-relaxed">
                See what freelancers and clients are sharing, post wins and questions, and keep your network warm — all
                in one calm, focused stream.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadFeed(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div className="min-w-0 space-y-6">
            <div className="animate-slideUp" style={{ animationDelay: "0.05s" }}>
              <FeedDiscoverPanel />
            </div>

            <div className="animate-slideUp" style={{ animationDelay: "0.08s" }}>
              <FeedComposer
                userName={user?.name}
                userAvatarUrl={user?.avatarUrl}
                fallbackAvatar={fallbackAvatar}
                content={content}
                setContent={setContent}
                previews={previews}
                fileInputRef={fileInputRef}
                posting={posting}
                onSubmit={handleSubmit}
                onPickFiles={() => fileInputRef.current?.click()}
                onFileChange={handleFileSelect}
                onRemoveFile={removeFile}
                isImage={isImage}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border bg-card/50">
                <Loader2 className="animate-spin text-violet-600 mb-3" size={36} />
                <p className="text-muted-foreground">Loading your feed…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/40 to-card p-10 sm:p-14 text-center shadow-soft animate-slideUp">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">The stream is quiet</h2>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Be the first to share a launch, a lesson learned, or a question — your post helps others discover you.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/dashboard/browse"
                    className="inline-flex items-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                  >
                    Browse projects
                  </Link>
                  <Link
                    href="/friends"
                    className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
                  >
                    Grow your network
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post, index) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    index={index}
                    currentUserId={user?.id}
                    token={token}
                    fallbackAvatar={fallbackAvatar}
                    isOwnPost={post.author.id === user?.id}
                    formatTime={formatTime}
                    isImage={isImage}
                    expanded={!!expandedComments[post.id]}
                    comments={comments[post.id]}
                    commentInput={commentInputs[post.id] ?? ""}
                    commentLoading={!!commentLoading[post.id]}
                    onLike={() => handleLike(post.id)}
                    onDelete={() => handleDelete(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    onCommentChange={(v) => setCommentInputs((prev) => ({ ...prev, [post.id]: v }))}
                    onSubmitComment={() => handleAddComment(post.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <FeedSidebar
              userName={user?.name}
              userAvatarUrl={user?.avatarUrl}
              fallbackAvatar={fallbackAvatar}
              postCount={posts.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
