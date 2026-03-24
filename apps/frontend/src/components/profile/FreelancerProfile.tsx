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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  paymentHistory?: {
    id: string;
    amount: number;
    projectTitle: string;
    date: string;
  }[];
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
  // Placeholder stats
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
  onAddPortfolio?: () => void;
};

// ── Profile completion tracking ──────────────────────────────────────
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

function ProfileCompletionCard({ onEdit, data, kycStatus }: { onEdit?: () => void, data: FreelancerProfileData, kycStatus: string }) {
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

  const { label, labelColor, trackColor } =
    percent >= 100 ? { label: "All star profile",    labelColor: "text-emerald-600", trackColor: "bg-emerald-500" } :
    percent >= 80  ? { label: "Expert",               labelColor: "text-blue-600",    trackColor: "bg-blue-500"    } :
    percent >= 60  ? { label: "Rising talent",        labelColor: "text-violet-600",  trackColor: "bg-violet-500"  } :
    percent >= 40  ? { label: "Intermediate",         labelColor: "text-amber-600",   trackColor: "bg-amber-500"   } :
                     { label: "Just getting started", labelColor: "text-rose-500",    trackColor: "bg-rose-400"    };

  const handleGo = () => onEdit ? onEdit() : router.push("/profile/edit");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-800">Profile completion</p>
          <span className={`text-sm font-bold ${labelColor}`}>{percent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${trackColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className={`mt-2 text-xs font-semibold ${labelColor}`}>{label}</p>
      </div>

      <ul className="divide-y divide-slate-100">
        {FREELANCER_STEPS.map((step) => {
          const done = map[step.key];
          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={handleGo}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={18} className="text-slate-300 shrink-0" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-xs font-semibold truncate ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-slate-400 truncate">{step.hint}</p>
                  )}
                </div>
                {!done && (
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {percent < 100 && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleGo}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-accent hover:opacity-90 transition-all"
          >
            Complete your profile
          </button>
        </div>
      )}
    </div>
  );
}

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
  onAddPortfolio,
}: FreelancerProfileProps) {
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const location = [data.city, data.country].filter(Boolean).join(", ");
  const joinedDate = data.createdAt
    ? `Joined ${new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
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
        primaryCta={
          !isOwnProfile && onHire
            ? { label: "Hire", onClick: onHire, loading: messageLoading }
            : undefined
        }
        secondaryCta={
          !isOwnProfile && onMessage ? { label: "Message", onClick: onMessage } : undefined
        }
      />
      
      {isOwnProfile && onUpdate && (
        <InlineEditableSection
          title="Headline"
          value={data.headline ?? ""}
          onSave={async (v) => { await onUpdate({ headline: v }); }}
          placeholder="Add a headline (e.g. Senior Full Stack Developer)"
          icon={<Briefcase className="size-5" />}
        />
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isOwnProfile && onUpdate ? (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm relative group">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="size-4" />
              <span className="text-xs font-medium">Hourly Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={data.hourlyRate || 0}
                onChange={(e) => onUpdate({ hourlyRate: parseInt(e.target.value) })}
                className="w-16 bg-transparent text-lg font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              />
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          </div>
        ) : (
          data.hourlyRate != null && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="size-4" />
                <span className="text-xs font-medium">Hourly Rate</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                ${data.hourlyRate}/hr
              </p>
            </div>
          )
        )}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="size-4" />
            <span className="text-xs font-medium">Availability</span>
          </div>
          {isOwnProfile && onUpdate ? (
            <button
              onClick={() => onUpdate({ availability: !data.availability })}
              className={`text-sm font-semibold transition-colors ${
                data.availability ? "text-green-600 dark:text-green-400" : "text-amber-600"
              }`}
            >
              {data.availability ? "● Available" : "○ Busy"}
            </button>
          ) : (
            <p
              className={`text-sm font-medium ${
                data.availability ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              }`}
            >
              {data.availability ? "Available" : "Not available"}
            </p>
          )}
        </div>
        {completedProjects > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="size-4" />
              <span className="text-xs font-medium">Projects</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {completedProjects}
            </p>
          </div>
        )}
        {rating != null && reviewCount > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="size-4" />
              <span className="text-xs font-medium">Rating</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {rating.toFixed(1)} ({reviewCount})
            </p>
          </div>
        )}
        {data.totalEarnings !== undefined && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="size-4" />
              <span className="text-xs font-medium">Total Earnings</span>
            </div>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              ${data.totalEarnings.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Skills */}
      <ProfileCard title="Skills" icon={<Sparkles className="size-5" />}>
        {skills.length > 0 ? (
          <SkillsTags skills={skills} />
        ) : (
          <EmptyState
            title="No skills added yet"
            description="Add your top skills so clients can discover you in search"
            action={isOwnProfile && onEdit && (
              <button
                onClick={onEdit}
                className="text-sm font-medium text-primary hover:underline"
              >
                Add skills
              </button>
            )}
          />
        )}
      </ProfileCard>

      {/* About */}
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
        <ProfileCard title="About" icon={<Briefcase className="size-5" />}>
          {data.bio ? (
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {data.bio}
            </p>
          ) : (
            <EmptyState
              title="Your story is missing"
              description="A short bio helps clients understand your experience and approach"
              action={isOwnProfile && onEdit && (
                <button
                  onClick={onEdit}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Add bio
                </button>
              )}
            />
          )}
        </ProfileCard>
      )}

      {/* Portfolio Section */}
      <ProfileCard
        title="Portfolio"
        icon={<FolderKanban className="size-5" />}
        action={
          isOwnProfile && onAddPortfolio ? (
            <button
              onClick={onAddPortfolio}
              className="text-sm font-medium text-primary hover:underline"
            >
              Add portfolio
            </button>
          ) : undefined
        }
      >
        {portfolioProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolioProjects.map((p) => (
              <div key={p.id} className="group border border-border rounded-xl overflow-hidden hover:shadow-md transition-all bg-card flex flex-col">
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                  {p.imageUrl ? (
                    <img src={toPublicUrl(p.imageUrl)} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FolderKanban className="size-8" />
                    </div>
                  )}
                  {p.liveLink && (
                    <a
                      href={p.liveLink.startsWith('http') ? p.liveLink : `https://${p.liveLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-semibold text-foreground">{p.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">{p.description}</p>
                  {p.skills && p.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                      {p.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">+{p.skills.length - 3}</span>
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
              <button
                onClick={onAddPortfolio}
                className="text-sm font-medium text-primary hover:underline"
              >
                Add portfolio
              </button>
            )}
          />
        )}
      </ProfileCard>

      {/* Payment History */}
      {isOwnProfile && data.paymentHistory && data.paymentHistory.length > 0 && (
        <ProfileCard title="Payment History" icon={<DollarSign className="size-5" />}>
          <div className="space-y-3">
            {data.paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.projectTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +${payment.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ProfileCard>
      )}

      {/* Reviews placeholder */}
      {(rating != null || reviewCount > 0) && (
        <ProfileCard title="Reviews" icon={<Star className="size-5" />}>
          <p className="text-sm text-muted-foreground">
            {rating != null && reviewCount > 0
              ? `${rating.toFixed(1)} average from ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
          </ProfileCard>
        )}
      </div>

      {/* Right Column: Profile completion card */}
      {isOwnProfile && (
        <div className="lg:col-span-1">
          <ProfileCompletionCard onEdit={onEdit} data={data} kycStatus={kycStatus} />
        </div>
      )}
    </div>
  );
}
