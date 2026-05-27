"use client";

import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard } from "./ProfileCard";
import { SkillsTags } from "./SkillsTags";
import { EmptyState } from "./EmptyState";
import { InlineEditableSection } from "./InlineEditableSection";
import {
  Sparkles,
  DollarSign,
  Clock,
  Briefcase,
  Star,
  FolderKanban,
  CheckCircle2,
  Circle,
  ChevronRight,
  ExternalLink,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type FreelancerProfileData = {
  name: string;
  headline?: string | null;
  bio?: string | null;
  skills?: string[];
  avatarUrl?: string | null;
  availability?: boolean | null;
  createdAt?: string;
  country?: string | null;
  city?: string | null;
  hourlyRate?: number | null;
  totalEarnings?: number;
};

type FreelancerProfileProps = {
  data: FreelancerProfileData;
  fallbackAvatar: string;
  toPublicUrl: (url?: string | null) => string;
  isOwnProfile?: boolean;
  onUpdate?: (data: Partial<FreelancerProfileData>) => Promise<void>;
  onEdit?: () => void;
  onAvatarUpload?: (file: File) => Promise<void>;
  onHire?: () => void;
  onMessage?: () => void;
  messageLoading?: boolean;
  onSaveBio?: (bio: string) => Promise<void>;
  completedProjects?: number;
  rating?: number | null;
  reviewCount?: number;
  kycStatus?: "verified" | "pending" | "unverified";
  portfolioProjects?: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    imageUrl?: string | null;
    liveLink?: string | null;
    createdAt: string;
  }[];
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
  onAddPortfolio?: () => void;
  userId?: string;
};

/* ── Profile completion tracking ── */
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
const FREELANCER_STEPS = [
  { key: "photo",    label: "Profile photo",    hint: "Add a professional photo"       },
  { key: "headline", label: "Headline",          hint: "Add a compelling title"         },
  { key: "bio",      label: "Bio / about",       hint: "Tell clients about your skills" },
  { key: "location", label: "Location",          hint: "Add your country & city"        },
  { key: "kyc",      label: "Identity verified", hint: "Complete ID verification"       },
];

/* ── Donut completion card ── */
function ProfileCompletionCard({
  onEdit,
  data,
  kycStatus,
}: {
  onEdit?: () => void;
  data: FreelancerProfileData;
  kycStatus: string;
}) {
  const router = useRouter();
  const map = buildMap({
    avatarUrl: data.avatarUrl ?? null,
    headline: data.headline ?? null,
    bio: data.bio ?? null,
    country: data.country ?? null,
    city: data.city ?? null,
    kycStatus: kycStatus as "verified" | "pending" | "unverified",
  });
  const completed = FREELANCER_STEPS.filter((s) => map[s.key]).length;
  const percent = Math.round((completed / FREELANCER_STEPS.length) * 100);

  /* SVG arc math */
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const arcColor =
    percent >= 100 ? "#10b981" :
    percent >= 80  ? "#6366f1" :
    percent >= 60  ? "#8b5cf6" :
    percent >= 40  ? "#f59e0b" :
                     "#f43f5e";
  const label =
    percent >= 100 ? "All star" :
    percent >= 80  ? "Expert" :
    percent >= 60  ? "Rising talent" :
    percent >= 40  ? "Intermediate" :
                     "Beginner";

  const handleGo = () => (onEdit ? onEdit() : router.push("/profile/edit"));

  return (
    <div className="profile-card sticky top-24">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-6 pt-6 pb-8 rounded-t-3xl">
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-4">Profile strength</p>
        {/* Donut */}
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
            <p className="text-white/70 text-sm mt-1">{completed}/{FREELANCER_STEPS.length} complete</p>
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="profile-card-inner pt-2 pb-2">
        <ul className="space-y-0.5">
          {FREELANCER_STEPS.map((step) => {
            const done = map[step.key];
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={handleGo}
                  className="w-full flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-violet-50 transition-colors group text-left"
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
                  {!done && (
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA */}
      {percent < 100 && (
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleGo}
            className="w-full py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 shadow-[0_8px_24px_-6px_rgba(109,40,217,0.45)] transition-all"
          >
            Complete your profile →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Stat tile ── */
function StatTile({
  icon,
  iconBg,
  label,
  value,
  sub,
  accent,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: React.ReactNode;
  sub?: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("stat-tile bg-white border", accent)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("flex size-9 items-center justify-center rounded-2xl", iconBg)}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      {value !== undefined && (
        <div className="text-3xl font-black tabular-nums leading-none text-slate-900">
          {value}
        </div>
      )}
      {sub && <p className="text-[11px] mt-1 font-semibold text-slate-500">{sub}</p>}
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FreelancerProfile
══════════════════════════════════════════════════════════════ */
export function FreelancerProfile({
  data,
  fallbackAvatar,
  toPublicUrl,
  isOwnProfile,
  onUpdate,
  onEdit,
  onAvatarUpload,
  onHire,
  onMessage,
  messageLoading,
  onSaveBio,
  completedProjects = 0,
  rating,
  reviewCount = 0,
  kycStatus = "unverified",
  portfolioProjects = [],
  projects = [],
  userId,
  onAddPortfolio,
}: FreelancerProfileProps) {
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const location = [data.city, data.country].filter(Boolean).join(", ");
  const joinedDate = data.createdAt
    ? `Joined ${new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-9 items-start">

      {/* ── Left / main column ── */}
      <div className="lg:col-span-2 space-y-7">

        {/* Profile header */}
        <ProfileHeader
          name={data.name}
          headline={data.headline}
          avatarUrl={data.avatarUrl}
          role="FREELANCER"
          location={location || undefined}
          joinedDate={joinedDate}
          fallbackAvatar={fallbackAvatar}
          toPublicUrl={toPublicUrl}
          isOwnProfile={isOwnProfile}
          onEdit={onEdit}
          onAvatarUpload={onAvatarUpload}
          bannerVariant
          ratingSummary={rating != null && reviewCount > 0 ? { rating, count: reviewCount } : null}
          verification={kycStatus === "verified" ? "verified" : kycStatus === "pending" ? "pending" : null}
          availabilityHighlight={data.availability}
          primaryCta={!isOwnProfile && onHire ? { label: "Hire", onClick: onHire, loading: messageLoading } : undefined}
          secondaryCta={!isOwnProfile && onMessage ? { label: "Message", onClick: onMessage } : undefined}
        />

        {/* Headline edit (own profile) */}
        {isOwnProfile && onUpdate && (
          <InlineEditableSection
            title="Headline"
            value={data.headline ?? ""}
            onSave={async (v) => { await onUpdate({ headline: v }); }}
            placeholder="Add a headline (e.g. Senior Full Stack Developer)"
            icon={<Briefcase className="size-5" />}
          />
        )}

        {/* ── Stat tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">

          {/* Hourly rate */}
          {isOwnProfile && onUpdate ? (
            <div className="stat-tile bg-white border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-100">
                  <DollarSign className="size-4 text-emerald-700" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hourly rate</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-slate-400">$</span>
                <input
                  type="number"
                  value={data.hourlyRate || 0}
                  onChange={(e) => onUpdate({ hourlyRate: parseInt(e.target.value, 10) || 0 })}
                  className="w-20 bg-transparent text-3xl font-black text-slate-900 tabular-nums focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-400">/hr</span>
              </div>
            </div>
          ) : data.hourlyRate != null ? (
            <StatTile
              icon={<DollarSign className="size-4 text-emerald-700" />}
              iconBg="bg-emerald-100"
              label="Hourly rate"
              value={<>${data.hourlyRate}<span className="text-lg text-slate-400 font-bold">/hr</span></>}
              accent="border-emerald-200"
            />
          ) : null}

          {/* Availability */}
          <div className={cn(
            "stat-tile bg-white border",
            data.availability ? "border-violet-200" : "border-slate-200"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("flex size-9 items-center justify-center rounded-2xl", data.availability ? "bg-violet-100" : "bg-slate-100")}>
                <Clock className={cn("size-4", data.availability ? "text-violet-700" : "text-slate-500")} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Availability</span>
            </div>
            {isOwnProfile && onUpdate ? (
              <button
                type="button"
                onClick={() => onUpdate({ availability: !data.availability })}
                className="text-left"
              >
                <p className={cn("text-lg font-black leading-tight", data.availability ? "text-violet-700" : "text-slate-500")}>
                  {data.availability ? "● Available" : "○ Busy"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Tap to toggle</p>
              </button>
            ) : (
              <p className={cn("text-lg font-black leading-tight", data.availability ? "text-violet-700" : "text-slate-500")}>
                {data.availability ? "● Available" : "○ Unavailable"}
              </p>
            )}
          </div>

          {/* Completed projects */}
          {completedProjects > 0 && (
            <StatTile
              icon={<Trophy className="size-4 text-sky-700" />}
              iconBg="bg-sky-100"
              label="Completed"
              value={completedProjects}
              sub="projects done"
              accent="border-sky-200"
            />
          )}

          {/* Rating */}
          {rating != null && reviewCount > 0 && (
            <StatTile
              icon={<Star className="size-4 text-amber-600 fill-amber-400" />}
              iconBg="bg-amber-100"
              label="Rating"
              value={<>{rating.toFixed(1)}<span className="text-base text-slate-400 font-bold ml-1">/ 5</span></>}
              sub={`${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
              accent="border-amber-200"
            />
          )}

          {/* Total earnings */}
          {data.totalEarnings !== undefined && (
            <StatTile
              icon={<TrendingUp className="size-4 text-rose-600" />}
              iconBg="bg-rose-100"
              label="Total earnings"
              value={`$${data.totalEarnings.toLocaleString()}`}
              accent="border-rose-200"
            />
          )}
        </div>

        {/* ── Skills ── */}
        <ProfileCard title="Skills & expertise" icon={<Sparkles className="size-5" />} accent="violet">
          {skills.length > 0 ? (
            <SkillsTags skills={skills} />
          ) : (
            <EmptyState
              title="No skills listed yet"
              description="Add your top skills so clients can find you in search"
              action={isOwnProfile && onEdit && (
                <button onClick={onEdit} className="text-sm font-semibold text-violet-600 hover:underline">
                  Add skills →
                </button>
              )}
            />
          )}
        </ProfileCard>

        {/* ── About ── */}
        {isOwnProfile && onSaveBio ? (
          <InlineEditableSection
            title="About"
            value={data.bio ?? ""}
            onSave={onSaveBio}
            placeholder="Tell clients about yourself and your experience"
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
                title="No bio yet"
                description="A short bio helps clients understand your experience and approach"
                action={isOwnProfile && onEdit && (
                  <button onClick={onEdit} className="text-sm font-semibold text-violet-600 hover:underline">
                    Add bio →
                  </button>
                )}
              />
            )}
          </ProfileCard>
        )}

        {/* ── Portfolio ── */}
        <ProfileCard
          title="Portfolio"
          icon={<FolderKanban className="size-5" />}
          accent="violet"
          action={isOwnProfile && onAddPortfolio ? (
            <button onClick={onAddPortfolio} className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
              <span className="text-lg leading-none">+</span> Add project
            </button>
          ) : undefined}
        >
          {portfolioProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {portfolioProjects.map((p) => (
                <div key={p.id} className="portfolio-card group">
                  <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-violet-50 overflow-hidden relative">
                    {p.imageUrl ? (
                      <img
                        src={toPublicUrl(p.imageUrl)}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderKanban className="size-12 text-violet-200" />
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="portfolio-card-overlay">
                      <p className="text-white font-black text-sm line-clamp-1">{p.title}</p>
                      <p className="text-white/80 text-xs line-clamp-2 mt-0.5">{p.description}</p>
                      {p.liveLink && (
                        <a
                          href={p.liveLink.startsWith("http") ? p.liveLink : `https://${p.liveLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 backdrop-blur-sm border border-white/30 transition-all"
                        >
                          <ExternalLink size={12} />
                          View live
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-black text-foreground text-sm">{p.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                    {p.skills && p.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.skills.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold skill-pill-${i % 8}`}>{s}</span>
                        ))}
                        {p.skills.length > 4 && (
                          <span className="text-[10px] text-muted-foreground font-medium">+{p.skills.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="size-8" />}
              title="No portfolio yet"
              description="Add your best work to show clients what you can do"
              action={isOwnProfile && onAddPortfolio && (
                <button onClick={onAddPortfolio} className="text-sm font-semibold text-violet-600 hover:underline">
                  Add a project →
                </button>
              )}
            />
          )}
        </ProfileCard>

        {/* ── Job history — timeline ── */}
        <ProfileCard title="Job history" icon={<Briefcase className="size-5" />} accent="warm">
          {projects.length > 0 ? (
            <div className="relative pl-10">
              {/* Vertical line */}
              <div className="timeline-line" />
              <div className="space-y-8">
                {projects.map((proj, idx) => {
                  const isCompleted = proj.status === "COMPLETED";
                  const reviewsForUser = proj.contract?.reviews?.filter(
                    (r) => !userId || r.revieweeId === userId
                  ) ?? [];

                  return (
                    <div key={proj.id} className="relative">
                      {/* Dot */}
                      <div
                        className={cn(
                          "timeline-dot",
                          isCompleted
                            ? "bg-emerald-500 border-emerald-200 shadow-emerald-200"
                            : "bg-blue-500 border-blue-200 shadow-blue-200"
                        )}
                      >
                        {isCompleted
                          ? <span className="size-2 rounded-full bg-white" />
                          : <span className="size-1.5 rounded-full bg-white" />
                        }
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="font-black text-sm text-foreground">{proj.title}</h4>
                          <span className={cn(
                            "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide",
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(proj.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>

                        {/* Reviews */}
                        {reviewsForUser.length > 0 ? (
                          <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-xl border border-amber-100 p-3 space-y-2">
                            {reviewsForUser.map((rev, i) => (
                              <div key={i}>
                                <div className="flex items-center gap-0.5 mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={11} className={star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                  ))}
                                  <span className="ml-1.5 text-[10px] font-bold text-amber-700">{rev.rating}.0</span>
                                </div>
                                {rev.comment && <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>}
                              </div>
                            ))}
                          </div>
                        ) : isCompleted ? (
                          <p className="text-[11px] text-muted-foreground/60 mt-2 italic">No review yet</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="size-8" />}
              title="No job history yet"
              description="Active and completed projects will appear here"
            />
          )}
        </ProfileCard>
      </div>

      {/* ── Right column ── */}
      {isOwnProfile && (
        <div className="lg:col-span-1">
          <ProfileCompletionCard onEdit={onEdit} data={data} kycStatus={kycStatus} />
        </div>
      )}
    </div>
  );
}
