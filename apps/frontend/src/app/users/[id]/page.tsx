"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useToast } from "@/context/ToastContext";
import {
  ArrowLeft,
  Loader2,
  Briefcase,
  Star,
  ExternalLink,
  UserCircle,
  Copy,
  UserPlus,
  Users,
  FolderKanban,
  Sparkles,
} from "lucide-react";

type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  imageUrl?: string | null;
  liveLink?: string | null;
  createdAt: string;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    profile: { name: string | null; avatarUrl: string | null } | null;
  };
};

type PublicProfile = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isFriend: boolean;
  isOwnProfile: boolean;
  reviewCount?: number;
  rating?: number;
  profile?: {
    name: string | null;
    headline: string | null;
    bio: string | null;
    skills: unknown;
    avatarUrl: string | null;
    country: string | null;
    city: string | null;
    state: string | null;
    availability: boolean | null;
    hourlyRate?: number | null;
    kycStatus?: string | null;
  } | null;
  portfolioProjects?: PortfolioProject[];
  projects?: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    contract?: {
      id: string;
      reviews?: { rating: number; comment: string | null; revieweeId: string }[] | null;
    } | null;
  }[];
};

type TabId = "overview" | "work" | "reviews";

export default function UserProfilePage() {
  const { token, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

  const loadProfile = useCallback(async () => {
    if (!userId?.trim()) {
      setLoading(false);
      setProfile(null);
      return;
    }
    try {
      setLoading(true);
      const data = await get<PublicProfile>(`/profile/${userId}`, token || undefined);
      setProfile(data);
      try {
        const reviewData = await get<ReviewItem[]>(`/reviews/user/${userId}`, undefined);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch {
        setReviews([]);
      }
    } catch (err: unknown) {
      const msg = String((err as Error)?.message || "").toLowerCase();
      if (msg.includes("not found") || msg.includes("404")) {
        setProfile(null);
        return;
      }
      const authErrors = ["unauthorized", "token", "expired", "missing token", "invalid token"];
      if (authErrors.some((p) => msg.includes(p)) && !msg.includes("not found")) {
        if (token) logout();
        router.replace("/login");
        return;
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, token, logout, router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function startConversation() {
    if (!token || !profile) return;
    setActionLoading(true);
    try {
      const conversations = await get<Array<{ id: string; participant: { id: string } }>>("/conversations", token);
      const conv = conversations.find((c) => c.participant.id === userId);
      if (conv) {
        router.push(`/messages/${conv.id}`);
      } else {
        const newConv = await post<{ id: string }>("/conversations", { freelancerId: userId }, token);
        router.push(`/messages/${newConv.id}`);
      }
    } catch (err: unknown) {
      toast.toast((err as Error)?.message || "Failed to start conversation", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function sendFriendRequest() {
    if (!token) {
      router.push(`/login?redirect=/users/${userId}`);
      return;
    }
    setFriendLoading(true);
    try {
      await post(`/friends/request/${userId}`, {}, token);
      toast.toast("Friend request sent", "success");
      await loadProfile();
    } catch (err: unknown) {
      const m = (err as Error)?.message || "Could not send request";
      toast.toast(m, "error");
    } finally {
      setFriendLoading(false);
    }
  }

  function copyProfileUrl() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(
      () => toast.toast("Profile link copied", "success"),
      () => toast.toast("Could not copy", "error")
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-40 sm:h-48 bg-muted animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end gap-5 -mt-16 mb-8">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-muted animate-pulse border-4 border-background shadow-lg" />
            <div className="space-y-2 pb-2 flex-1">
              <div className="h-7 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-full max-w-md bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <UserCircle className="size-14 text-muted-foreground/40" />
        <p className="text-muted-foreground font-medium">Profile not found</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-violet-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (profile.isOwnProfile) {
    router.replace("/profile");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  const name = profile.profile?.name || "User";
  const isFreelancer = profile.role === "FREELANCER";
  const skills = Array.isArray(profile.profile?.skills) ? (profile.profile!.skills as string[]) : [];
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const location = [profile.profile?.city, profile.profile?.country].filter(Boolean).join(", ");
  const joinedDate = profile.createdAt
    ? `Joined ${new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    : undefined;

  const completedProjects = profile.projects?.filter((p) => p.status === "COMPLETED").length ?? 0;
  const activeProjects = profile.projects?.filter((p) => p.status === "ACTIVE").length ?? 0;
  const rating = profile.rating ?? 0;
  const reviewCount = profile.reviewCount ?? reviews.length;

  const hasPortfolioSection = isFreelancer && (profile.portfolioProjects?.length ?? 0) > 0;
  const hasProjectsSection = (profile.projects?.length ?? 0) > 0;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    {
      id: "work",
      label: "Work & portfolio",
      count: (profile.portfolioProjects?.length ?? 0) + (profile.projects?.length ?? 0),
    },
    { id: "reviews", label: "Reviews", count: reviews.length },
  ];

  const kyc = profile.profile?.kycStatus;
  const verification =
    kyc === "APPROVED" ? "verified" : kyc === "PENDING" ? "pending" : null;

  return (
    <div className="min-h-screen profile-shell pb-16">
      <div className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <span className="text-border">|</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Public profile</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-amber-400/10 px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700 mb-1">How others see you</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            This public page highlights your work and reviews. Share your link when you pitch or apply — keep your headline and portfolio fresh.
          </p>
        </div>

        <ProfileHeader
          name={name}
          headline={profile.profile?.headline}
          avatarUrl={profile.profile?.avatarUrl}
          role={isFreelancer ? "FREELANCER" : "CLIENT"}
          location={location || undefined}
          joinedDate={joinedDate}
          fallbackAvatar={fallbackAvatar}
          toPublicUrl={toPublicUrl}
          bannerVariant
          ratingSummary={reviewCount > 0 ? { rating, count: reviewCount } : null}
          verification={verification}
          availabilityHighlight={isFreelancer ? profile.profile?.availability : null}
          primaryCta={
            token
              ? { label: "Message", onClick: startConversation, loading: actionLoading }
              : undefined
          }
          secondaryCta={
            token && isFreelancer
              ? { label: "Hire / invite", onClick: startConversation }
              : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyProfileUrl}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              <Copy className="size-3.5" />
              Copy link
            </button>
            {token && (
              <>
                {profile.isFriend ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 px-3 py-1.5 text-xs font-semibold">
                    <Users className="size-3.5" />
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendFriendRequest}
                    disabled={friendLoading}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100 transition-colors disabled:opacity-50"
                  >
                    {friendLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="size-3.5" />
                    )}
                    Add friend
                  </button>
                )}
              </>
            )}
          </div>
        </ProfileHeader>

        {!token && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
            <Link href={`/login?redirect=/users/${userId}`} className="font-semibold underline underline-offset-2">
              Sign in
            </Link>{" "}
            to message, connect, or hire this member.
          </div>
        )}

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-muted/50 border border-border/90 shadow-inner">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[7rem] sm:flex-none rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 scale-[1.02]"
                  : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm border border-transparent hover:border-border"
              }`}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span
                  className={`ml-2 tabular-nums text-xs font-bold ${
                    tab === t.id ? "text-white/90" : "opacity-70"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-feed-fade-in">
            <div className="lg:col-span-2 space-y-6">
              {profile.profile?.bio ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-warm">
                  <h2 className="font-display font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="size-5 text-violet-600" />
                    About
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{profile.profile.bio}</p>
                </section>
              ) : (
                <section className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  No bio yet.
                </section>
              )}

              {isFreelancer && skills.length > 0 && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-warm">
                  <h2 className="font-display font-bold text-lg text-foreground mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 text-sm font-medium rounded-full bg-violet-500/10 text-violet-800 border border-violet-500/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-warm space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Snapshot</h3>
                {isFreelancer && profile.profile?.hourlyRate != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hourly rate</span>
                    <span className="font-bold text-foreground">${profile.profile.hourlyRate}/hr</span>
                  </div>
                )}
                {completedProjects > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-bold text-foreground">{completedProjects} projects</span>
                  </div>
                )}
                {activeProjects > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-bold text-foreground">{activeProjects} projects</span>
                  </div>
                )}
                {!isFreelancer && (profile.projects?.length ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posted jobs</span>
                    <span className="font-bold text-foreground">{profile.projects!.length}</span>
                  </div>
                )}
              </div>

              {isFreelancer && (
                <div
                  className={`rounded-2xl border p-5 ${
                    profile.profile?.availability
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-muted/40 border-border"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${profile.profile?.availability ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"}`}
                    />
                    {profile.profile?.availability ? "Open to new work" : "Not available"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.profile?.availability
                      ? "Reach out with a message to discuss scope and timing."
                      : "They may still respond to messages."}
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === "work" && (
          <div className="space-y-8 animate-feed-fade-in">
            {hasPortfolioSection && (
              <section>
                <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                  <FolderKanban className="size-5 text-violet-600" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolioProjects!.map((p) => (
                    <article
                      key={p.id}
                      className="group rounded-2xl border border-border bg-card overflow-hidden shadow-warm hover:shadow-warm-md transition-shadow"
                    >
                      <div className="aspect-video bg-muted relative">
                        {p.imageUrl ? (
                          <img
                            src={toPublicUrl(p.imageUrl)}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-muted-foreground">
                            <FolderKanban className="size-10 opacity-30" />
                          </div>
                        )}
                        {p.liveLink && (
                          <a
                            href={p.liveLink.startsWith("http") ? p.liveLink : `https://${p.liveLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 rounded-full bg-background/90 p-2 text-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground">{p.title}</h3>
                        {p.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                        )}
                        {p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {p.skills.slice(0, 5).map((s) => (
                              <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {hasProjectsSection && (
              <section>
                <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="size-5 text-violet-600" />
                  {isFreelancer ? "Projects on Lancerly" : "Posted projects"}
                </h2>
                <div className="space-y-3">
                  {profile.projects!.map((proj) => (
                    <Link
                      key={proj.id}
                      href={`/projects/${proj.id}`}
                      className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card hover:border-violet-300/60 hover:bg-violet-500/[0.03] transition-all group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-secondary group-hover:bg-violet-500/10 transition-colors shrink-0">
                          <Briefcase className="size-4 text-muted-foreground group-hover:text-violet-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-violet-700 transition-colors">
                            {proj.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(proj.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {proj.budgetMin != null && (
                          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                            ${proj.budgetMin.toLocaleString()}
                            {proj.budgetMax && proj.budgetMax !== proj.budgetMin
                              ? `–$${proj.budgetMax.toLocaleString()}`
                              : ""}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            proj.status === "COMPLETED"
                              ? "bg-emerald-500/15 text-emerald-700"
                              : proj.status === "ACTIVE"
                                ? "bg-blue-500/15 text-blue-700"
                                : proj.status === "OPEN"
                                  ? "bg-violet-500/15 text-violet-700"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {proj.status}
                        </span>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-violet-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {!hasPortfolioSection && !hasProjectsSection && (
              <p className="text-center text-muted-foreground text-sm py-12 border border-dashed border-border rounded-2xl">
                No public work items yet.
              </p>
            )}
          </div>
        )}

        {tab === "reviews" && (
          <div className="animate-feed-fade-in">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-16 border border-dashed border-border rounded-2xl">
                No reviews yet — completed contracts can leave feedback here.
              </p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => {
                  const reviewerName = r.reviewer?.profile?.name || "Member";
                  const revAvatar =
                    toPublicUrl(r.reviewer?.profile?.avatarUrl) ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`;
                  return (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-warm flex gap-4"
                    >
                      <img src={revAvatar} alt="" className="size-11 rounded-xl object-cover ring-2 ring-background shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <Link
                            href={`/users/${r.reviewer.id}`}
                            className="font-semibold text-foreground hover:text-violet-600 text-sm"
                          >
                            {reviewerName}
                          </Link>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= r.rating ? "text-amber-400 fill-amber-400" : "text-muted opacity-30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
