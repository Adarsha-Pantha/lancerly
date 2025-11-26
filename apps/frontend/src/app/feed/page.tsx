"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { get, postForm, del, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { Heart, Trash2, Image as ImageIcon, Video, X, Loader2, Send, Smile, MoreVertical } from "lucide-react";

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
  const { user, token } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      router.replace("/login?redirect=/feed");
    } else {
      loadFeed();
    }
  }, [token, router]);

  async function loadFeed() {
    if (!token) return;
    try {
      setLoading(true);
      const data = await get<Post[]>("/feed", token);
      setPosts(data);
    } catch (err: any) {
      console.error("Failed to load feed:", err);
      const msg = err?.message || "";
      const authErrors = ["Unauthorized", "token", "User not found", "Missing token", "Invalid token"];
      if (authErrors.some((p) => msg.includes(p))) {
        router.replace("/login?redirect=/feed");
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

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <h1 className="text-4xl font-bold gradient-text mb-2">Community Feed</h1>
          <p className="text-slate-600 text-lg">Share your thoughts, projects, and connect with the community</p>
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
                    <div className="flex items-center gap-3">
                      <img
                        src={toPublicUrl(post.author.profile?.avatarUrl || undefined) || fallbackAvatar}
                        alt={post.author.profile?.name || "User"}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {post.author.profile?.name || post.author.email}
                        </p>
                        <p className="text-sm text-slate-500">{formatTime(post.createdAt)}</p>
                      </div>
                    </div>
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
