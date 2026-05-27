"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard } from "./ProfileCard";
import { EmptyState } from "./EmptyState";
import { InlineEditableSection } from "./InlineEditableSection";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  DollarSign,
  ShieldCheck,
  FolderKanban,
  Star,
  CheckCircle2,
  ChevronRight,
  Users,
  TrendingUp,
} from "lucide-react";

export type ClientProfileData = {
  name: string;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  country?: string | null;
  city?: string | null;
};

type ClientProfileProps = {
  data: ClientProfileData;
  fallbackAvatar: string;
  toPublicUrl: (url?: string | null) => string;
  isOwnProfile?: boolean;
  onUpdate?: (data: Partial<ClientProfileData>) => Promise<void>;
  onEdit?: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onContact?: () => void;
  onMessage?: () => void;
  messageLoading?: boolean;
  onSaveBio?: (bio: string) => Promise<void>;
  postedJobs?: number;
  totalSpending?: number;
  verificationStatus?: "verified" | "pending" | "unverified";
  reviewCount?: number;
  rating?: number;
  projects?: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    _count?: { proposals: number };
    contract?: {
      id: string;
      reviews?: { rating: number; comment: string | null; revieweeId: string }[] | null;
    } | null;
  }[];
  userId?: string;
};

/* ── Completion steps ── */
type Completion = {
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  kycStatus: "verified" | "pending" | "unverified";
};
function buildMap(d: Completion): Record<string, boolean> {
  return {
    photo: !!d.avatarUrl,
    headline: !!d.headline?.trim(),
    bio: !!d.bio?.trim(),
    location: !!(d.country && d.city),
    kyc: d.kycStatus === "verified",
  };
}
const CLIENT_STEPS = [
  { key: "photo",    label: "Profile photo",    hint: "Add a professional photo"      },
  { key: "headline", label: "Headline",          hint: "Describe your company or role" },
  { key: "bio",      label: "Bio / about",       hint: "Tell freelancers about you"    },
  { key: "location", label: "Location",          hint: "Add your country & city"       },
  { key: "kyc",      label: "Identity verified", hint: "Complete ID verification"      },
];

/* ── Profile completion (donut, client theme) ── */
function ProfileCompletionCard({
  onEdit,
  data,
  kycStatus,
}: { onEdit?: () => void; data: ClientProfileData; kycStatus: string }) {
  const router = useRouter();
  const map = buildMap({
    avatarUrl: data.avatarUrl ?? null,
    headline: data.headline ?? null,
    bio: data.bio ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    kycStatus: kycStatus as "verified" | "pending" | "unverified",
  });
  const completed = CLIENT_STEPS.filter((s) => map[s.key]).length;
  const percent = Math.round((completed / CLIENT_STEPS.length) * 100);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const label =
    percent >= 100 ? "All star" :
    percent >= 80  ? "Expert" :
    percent >= 60  ? "Established" :
    percent >= 40  ? "Intermediate" :
                     "Getting started";

  const handleGo = () => (onEdit ? onEdit() : router.push("/profile/edit"));

  return (
    <div className="profile-card sticky top-24">
      {/* Client-themed gradient header (cyan/teal) */}
      <div className="bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 px-6 pt-6 pb-8 rounded-t-3xl">
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4">Profile strength</p>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
              <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
              <circle
                cx="45" cy="45" r={radius}
                fill="none"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-xl font-black tabular-nums leading-none">{percent}%</span>
            </div>
          </div>
          <div>
            <p className="text-white text-xl font-black leading-tight">{label}</p>
            <p className="text-white/70 text-sm mt-1">{completed}/{CLIENT_STEPS.length} complete</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="profile-card-inner pt-2 pb-2">
        <ul className="space-y-0.5">
          {CLIENT_STEPS.map((step) => {
            const done = map[step.key];
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={handleGo}
                  className="w-full flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-cyan-50 transition-colors group text-left"
                >
                  {done ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="size-[18px] shrink-0 rounded-full border-2 border-slate-200 flex items-center justify-center">
                      <span className="size-2 rounded-full bg-slate-200" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-semibold truncate", done ? "text-slate-400 line-through" : "text-slate-700")}>
                      {step.label}
                    </p>
                    {!done && <p className="text-[10px] text-slate-400 truncate">{step.hint}</p>}
                  </div>
                  {!done && <ChevronRight size={13} className="text-slate-300 group-hover:text-cyan-500 shrink-0 transition-colors" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {percent < 100 && (
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleGo}
            className="w-full py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 shadow-[0_8px_24px_-6px_rgba(14,116,144,0.45)] transition-all"
          >
            Complete your profile →
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ClientProfile
══════════════════════════════════════════════════════════════ */
export function ClientProfile({
  data,
  fallbackAvatar,
  toPublicUrl,
  isOwnProfile,
  onUpdate,
  onEdit,
  onAvatarUpload,
  onContact,
  onMessage,
  messageLoading,
  onSaveBio,
  postedJobs = 0,
  totalSpending,
  verificationStatus = "unverified",
  reviewCount = 0,
  rating,
  projects = [],
  userId,
}: ClientProfileProps) {
  const location = [data.city, data.country].filter(Boolean).join(", ");
  const joinedDate = data.createdAt
    ? `Joined ${new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-9 items-start">

      {/* ── Main column ── */}
      <div className="lg:col-span-2 space-y-7">

        <ProfileHeader
          name={data.name}
          headline={data.headline}
          avatarUrl={data.avatarUrl}
          role="CLIENT"
          location={location || undefined}
          joinedDate={joinedDate}
          fallbackAvatar={fallbackAvatar}
          toPublicUrl={toPublicUrl}
          isOwnProfile={isOwnProfile}
          onEdit={onEdit}
          onAvatarUpload={onAvatarUpload}
          bannerVariant
          ratingSummary={rating != null && reviewCount > 0 ? { rating, count: reviewCount } : null}
          verification={verificationStatus === "verified" ? "verified" : verificationStatus === "pending" ? "pending" : null}
          primaryCta={!isOwnProfile && onMessage ? { label: "Message", onClick: onMessage, loading: messageLoading } : undefined}
          secondaryCta={!isOwnProfile && onContact ? { label: "Contact", onClick: onContact } : undefined}
        />

        {isOwnProfile && onUpdate && (
          <InlineEditableSection
            title="Headline"
            value={data.headline ?? ""}
            onSave={async (v) => { await onUpdate({ headline: v }); }}
            placeholder="Describe your company or startup"
            icon={<Briefcase className="size-5" />}
          />
        )}

        {/* ── Stat tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">

          {/* Verification */}
          {verificationStatus === "verified" && (
            <div className="stat-tile bg-white border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-100">
                  <ShieldCheck className="size-4 text-emerald-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Trust</span>
              </div>
              <p className="text-lg font-black text-emerald-800">Verified client</p>
            </div>
          )}
          {verificationStatus === "pending" && (
            <div className="stat-tile bg-white border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100">
                  <ShieldCheck className="size-4 text-amber-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Trust</span>
              </div>
              <p className="text-base font-black text-amber-800 leading-snug">Verification in progress</p>
            </div>
          )}

          {/* Posted jobs */}
          {postedJobs > 0 && (
            <div className="stat-tile bg-white border border-sky-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-sky-100">
                  <FolderKanban className="size-4 text-sky-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Posted jobs</span>
              </div>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{postedJobs}</p>
            </div>
          )}

          {/* Total spending */}
          {totalSpending != null && totalSpending > 0 && (
            <div className="stat-tile bg-white border border-violet-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-violet-100">
                  <TrendingUp className="size-4 text-violet-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Invested</span>
              </div>
              <p className="text-2xl font-black text-slate-900 tabular-nums">${totalSpending.toLocaleString()}</p>
            </div>
          )}

          {/* Reviews */}
          {reviewCount > 0 && (
            <div className="stat-tile bg-white border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100">
                  <Star className="size-4 text-amber-600 fill-amber-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reviews</span>
              </div>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{reviewCount}</p>
            </div>
          )}

          {/* No projects yet */}
          {postedJobs === 0 && (
            <div className="stat-tile bg-white border border-slate-200 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-100">
                  <Users className="size-4 text-slate-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Talent</span>
              </div>
              <p className="text-base font-bold text-slate-500">No projects posted yet</p>
            </div>
          )}
        </div>

        {/* About */}
        {isOwnProfile && onSaveBio ? (
          <InlineEditableSection
            title="About"
            value={data.bio ?? ""}
            onSave={onSaveBio}
            placeholder="Tell freelancers about your company or projects"
            multiline
            maxLength={2000}
            icon={<Briefcase className="size-5" />}
          />
        ) : (
          <ProfileCard title="About" icon={<Briefcase className="size-5" />} accent="warm">
            {data.bio ? (
              <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">{data.bio}</p>
            ) : (
              <EmptyState
                title="No description yet"
                description="Share a bit about your company or what you're looking for"
                action={isOwnProfile && onEdit && (
                  <button onClick={onEdit} className="text-sm font-semibold text-cyan-600 hover:underline">Add description →</button>
                )}
              />
            )}
          </ProfileCard>
        )}

        {/* Job history — timeline */}
        <ProfileCard title="Project history" icon={<FolderKanban className="size-5" />} accent="sky">
          {projects.length > 0 ? (
            <div className="relative pl-10">
              <div className="timeline-line" style={{ background: "linear-gradient(to bottom, #06b6d4, #22d3ee, transparent)" }} />
              <div className="space-y-8">
                {projects.map((proj) => {
                  const isCompleted = proj.status === "COMPLETED";
                  const reviewsForUser = proj.contract?.reviews?.filter((r) => !userId || r.revieweeId === userId) ?? [];

                  return (
                    <div key={proj.id} className="relative">
                      <div className={cn(
                        "timeline-dot",
                        isCompleted ? "bg-emerald-500 border-emerald-200" : "bg-cyan-500 border-cyan-200"
                      )}>
                        <span className="size-2 rounded-full bg-white" />
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="min-w-0">
                            <h4 className="font-black text-sm text-foreground truncate">{proj.title}</h4>
                            {proj._count && proj._count.proposals > 0 && (
                              <p className="text-[11px] text-muted-foreground">
                                {proj._count.proposals} proposal{proj._count.proposals !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide",
                              isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-cyan-100 text-cyan-700"
                            )}>
                              {proj.status}
                            </span>
                            {proj.budgetMin != null && (
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                ${proj.budgetMin.toLocaleString()}{proj.budgetMax ? `–$${proj.budgetMax.toLocaleString()}` : "+"}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(proj.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>

                        {reviewsForUser.length > 0 && (
                          <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-xl border border-amber-100 p-3">
                            {reviewsForUser.map((rev, i) => (
                              <div key={i}>
                                <div className="flex items-center gap-0.5 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={11} className={star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                  ))}
                                </div>
                                {rev.comment && <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="size-8" />}
              title="No projects yet"
              description="Post your first project to start finding talent"
              action={isOwnProfile && (
                <Link href="/dashboard/projects/new" className="text-sm font-semibold text-cyan-600 hover:underline">
                  Post a project →
                </Link>
              )}
            />
          )}
        </ProfileCard>
      </div>

      {/* ── Right column ── */}
      {isOwnProfile && (
        <div className="lg:col-span-1">
          <ProfileCompletionCard onEdit={onEdit} data={data} kycStatus={verificationStatus} />
        </div>
      )}
    </div>
  );
}
