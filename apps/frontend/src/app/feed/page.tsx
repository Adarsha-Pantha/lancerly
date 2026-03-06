"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get, postForm, del, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  Heart,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  Send,
  Megaphone,
  BookOpen,
  Rocket,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Compass,
  ArrowRight,
} from "lucide-react";

type Post = {
  id: string;
  content: string | null;
  mediaUrls: string[];
  createdAt: string;
  author: {
    id: string;
    email: string;
    profile: {
      name: string;
      avatarUrl: string | null;
    } | null;
  };
  _count: {
    likes: number;
  };
  isLiked: boolean;
};

export default function FeedPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!token) {
      router.replace("/login?redirect=/feed");
      return;
    }
    
    loadFeed();
  }, [token, authLoading, router]);

  async function loadFeed() {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<Post[]>("/feed", token);
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load feed:", err);
      const msg = err?.message || "";
      const authErrors = ["Unauthorized", "token", "expired", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.toLowerCase().includes(p.toLowerCase()))) {
        // Clear expired/invalid token
        logout();
        router.replace("/login?redirect=/feed");
      } else {
        // For other errors, just show loading state as false
        console.error("Feed loading error:", err);
      }
    } finally {
      setLoading(false);
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
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
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
    } catch (err: any) {
      console.error("Post creation error:", err);
      const errorMsg = err?.message || "Failed to create post. Please check your connection and try again.";
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
    } catch (err: any) {
      console.error("Failed to like post:", err);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post?")) return;
    if (!token) return;

    try {
      await del(`/feed/${postId}`, token);
      await loadFeed();
    } catch (err: any) {
      alert(err?.message || "Failed to delete post");
    }
  }

  function isImage(url: string) {
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || url.startsWith("data:image");
  }

  function isVideo(url: string) {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.startsWith("blob:") && url.includes("video");
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
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  }

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    user?.name || "User"
  )}`;

  const whatsNewHighlights = [
    {
    title: "Role-based dashboards",
      description: "Switch between Client and Freelancer views to track projects, payments, and invites in one place.",
      icon: Megaphone,
      tag: "New",
    },
    {
      title: "Smart settings center",
      description: "Manage availability, notifications, two-factor auth, and privacy from a single streamlined screen.",
      icon: BookOpen,
      tag: "Updated",
    },
    {
      title: "Creative feed upgrades",
      description: "Post videos, celebrate wins, and discover community highlights right from your home feed.",
      icon: Sparkles,
      tag: "Hot",
    },
  ];

  const gettingStartedSteps = [
    {
      title: "Complete your profile",
      description: "Add a headline, skills, and work history so clients know what makes you unique.",
    },
    {
      title: "Share your first update",
      description: "Post a project win, a question, or a work-in-progress to start engaging with others.",
    },
    {
      title: "Explore opportunities",
      description: "Use Explore and Find Work to discover briefs, collaborators, and communities to join.",
    },
  ];

  const quickStartTips = [
    {
      title: "Follow the guidelines",
      description: "Stay respectful, be transparent about availability, and credit collaborators.",
      icon: BookOpen,
    },
    {
      title: "Ask for feedback",
      description: "Use the feed to request critique, share learnings, and support other builders.",
      icon: Lightbulb,
    },
    {
      title: "Act on insights",
      description: "Use dashboards and alerts to follow up on leads, proposals, and conversations quickly.",
      icon: Compass,
    },
    {
      title: "Launch with confidence",
      description: "Use project templates and our proposal tips to pitch faster and win more work.",
      icon: Rocket,
    },
    {
      title: "Celebrate milestones",
      description: "Post your launches, hires, and testimonials so the community can cheer you on.",
      icon: Heart,
    },
    {
      title: "Stay consistent",
      description: "Drop weekly updates to build your brand, attract clients, and grow trust.",
      icon: CheckCircle2,
    },
  ];

  // Show loading state while auth is loading or if no token
  if (authLoading || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600">
            {authLoading ? "Loading..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-sm font-semibold text-purple-700 bg-purple-50 rounded-full">
            <Sparkles size={16} />
            Home Feed
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Hey {user?.name || "there"}, here’s what’s happening on Lancerly
          </h1>
          <p className="text-slate-600 text-lg">
            Catch community highlights, share your wins, and follow our quick-start guide to get the most out of the
            platform.
          </p>
        </div>

        {/* Home Highlights */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="glass-effect rounded-2xl p-6 border border-purple-100 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
                  <Megaphone size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">What’s new</p>
                  <h2 className="text-xl font-semibold text-slate-900">Product updates & highlights</h2>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {whatsNewHighlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-purple-600">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        {item.title}
                        <span className="text-xs font-semibold uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 border border-blue-100 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">Getting started</p>
                <h2 className="text-xl font-semibold text-slate-900">Your first week on Lancerly</h2>
              </div>
            </div>
            <ol className="space-y-4">
              {gettingStartedSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 border border-slate-200 shadow-soft mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Lancerly playbook</p>
              <h2 className="text-2xl font-semibold text-slate-900">How to make the most of every post</h2>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Follow these community guidelines and tips to build trust, grow your network, and turn ideas into paid
                work faster.
              </p>
            </div>
            <button
              onClick={() => router.push("/landing")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors"
            >
              View full guidelines
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid gap-4 mt-6 md:grid-cols-2">
            {quickStartTips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white/80 flex gap-3">
                  <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{tip.title}</p>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Post Card */}
        {token && (
          <div className="glass-effect rounded-2xl shadow-soft p-6 mb-8 animate-slideUp">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={toPublicUrl(user?.avatarUrl || undefined) || fallbackAvatar}
                alt={user?.name || "You"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
              />
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">{user?.name || "You"}</p>
                <p className="text-sm text-slate-500">What's on your mind?</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ideas, or updates..."
                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all bg-white/50"
                rows={4}
              />

              {/* File Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden">
                      {isImage(preview) ? (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <video
                          src={preview}
                          className="w-full h-40 object-cover"
                          controls={false}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all hover:scale-105"
                  >
                    <ImageIcon size={18} />
                    <span className="hidden sm:inline">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all hover:scale-105"
                  >
                    <Video size={18} />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={posting || (!content.trim() && selectedFiles.length === 0)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {posting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </form>
          </div>
        )}

        {/* Feed Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
              <p className="text-slate-600">Loading feed...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-effect rounded-2xl shadow-soft p-16 text-center animate-slideUp">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No posts yet</h3>
              <p className="text-slate-600 mb-6">Be the first to share something with the community!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="glass-effect rounded-2xl shadow-soft overflow-hidden animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Post Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/users/${post.author.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={toPublicUrl(post.author.profile?.avatarUrl || undefined) || fallbackAvatar}
                        alt={post.author.profile?.name || "User"}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 hover:text-purple-600 transition-colors">
                          {post.author.profile?.name || post.author.email}
                        </p>
                        <p className="text-sm text-slate-500">{formatTime(post.createdAt)}</p>
                      </div>
                    </Link>
                    {token && post.author.id === user?.id && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <div className="p-5">
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px]">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Post Media */}
                {post.mediaUrls.length > 0 && (
                  <div className={`grid gap-2 ${post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {post.mediaUrls.map((url, idx) => {
                      const publicUrl = toPublicUrl(url);
                      return (
                        <div key={idx} className="relative overflow-hidden">
                          {isImage(publicUrl) ? (
                            <img
                              src={publicUrl}
                              alt={`Post media ${idx + 1}`}
                              className="w-full h-auto object-cover"
                            />
                          ) : (
                            <video
                              src={publicUrl}
                              controls
                              className="w-full h-auto"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 ${
                      post.isLiked
                        ? "text-red-600 bg-red-50"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Heart size={20} className={post.isLiked ? "fill-current" : ""} />
                    <span className="text-sm font-semibold">{post._count.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
