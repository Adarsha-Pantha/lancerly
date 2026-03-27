"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileCard } from "./ProfileCard";
import { EmptyState } from "./EmptyState";
import { InlineEditableSection } from "./InlineEditableSection";
import {
  Briefcase,
  DollarSign,
  ShieldCheck,
  FolderKanban,
  Star,
  CheckCircle2,
  Circle,
  ChevronRight,
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
      review?: { rating: number; comment: string | null } | null;
    } | null;
  }[];
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

const CLIENT_STEPS = [
  { key: "photo",    label: "Profile photo",    hint: "Add a professional photo"       },
  { key: "headline", label: "Headline",          hint: "Describe your company or role"  },
  { key: "bio",      label: "Bio / about",       hint: "Tell freelancers about you"     },
  { key: "location", label: "Location",          hint: "Add your country & city"        },
  { key: "kyc",      label: "Identity verified", hint: "Complete ID verification"       },
];



function ProfileCompletionCard({ onEdit, data, kycStatus }: { onEdit?: () => void, data: ClientProfileData, kycStatus: string }) {
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

  const { label, labelColor, trackColor } =
    percent >= 100 ? { label: "All star profile",    labelColor: "text-emerald-600", trackColor: "bg-emerald-500" } :
    percent >= 80  ? { label: "Expert",               labelColor: "text-blue-600",    trackColor: "bg-blue-500"    } :
    percent >= 60  ? { label: "Rising talent",        labelColor: "text-violet-600",  trackColor: "bg-violet-500"  } :
    percent >= 40  ? { label: "Intermediate",         labelColor: "text-amber-600",   trackColor: "bg-amber-500"   } :
                     { label: "Just getting started", labelColor: "text-rose-500",    trackColor: "bg-rose-400"    };

  const handleGo = () => onEdit ? onEdit() : router.push("/profile/edit");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
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

      {/* Steps */}
      <ul className="divide-y divide-slate-100">
        {CLIENT_STEPS.map((step) => {
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

      {/* CTA */}
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

// ── Main component ─────────────────────────────────────────────────────────
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
}: ClientProfileProps) {
  const location = [data.city, data.country].filter(Boolean).join(", ");
  const joinedDate = data.createdAt
    ? `Joined ${new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
    : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      {/* ── Left: main profile content (2 cols) ── */}
      <div className="lg:col-span-2 space-y-6">
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
          primaryCta={
            !isOwnProfile && onMessage
              ? { label: "Message", onClick: onMessage, loading: messageLoading }
              : undefined
          }
          secondaryCta={
            !isOwnProfile && onContact ? { label: "Contact", onClick: onContact } : undefined
          }
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

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {verificationStatus === "verified" && (
            <div className="rounded-xl border border-[#059669]/20 bg-[#059669]/5 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#059669] mb-1">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-medium">Verified</span>
              </div>
              <p className="text-sm font-medium text-[#059669]">Identity verified</p>
            </div>
          )}
          {verificationStatus === "pending" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="text-sm font-medium text-amber-700">Verification under review</p>
            </div>
          )}
          {postedJobs > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FolderKanban className="size-4" />
                <span className="text-xs font-medium">Posted Jobs</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{postedJobs}</p>
            </div>
          )}
          {totalSpending != null && totalSpending > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="size-4" />
                <span className="text-xs font-medium">Total Spent</span>
              </div>
              <p className="text-lg font-semibold text-foreground">${totalSpending.toLocaleString()}</p>
            </div>
          )}
          {reviewCount > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="size-4" />
                <span className="text-xs font-medium">Reviews</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{reviewCount}</p>
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
          <ProfileCard title="About" icon={<Briefcase className="size-5" />}>
            {data.bio ? (
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{data.bio}</p>
            ) : (
              <EmptyState
                title="No description yet"
                description="Share a bit about your company or what you're looking for"
                action={isOwnProfile && onEdit && (
                  <button onClick={onEdit} className="text-sm font-medium text-primary hover:underline">
                    Add description
                  </button>
                )}
              />
            )}
          </ProfileCard>
        )}

        {/* Posted Jobs */}
        <ProfileCard title="Posted Jobs" icon={<FolderKanban className="size-5" />}>
          {postedJobs > 0 ? (
            <p className="text-sm text-muted-foreground">
              {postedJobs} job{postedJobs === 1 ? "" : "s"} posted
            </p>
          ) : (
            <EmptyState
              icon={<FolderKanban className="size-8" />}
              title="No projects yet"
              description="Post your first project to start finding talent"
              action={isOwnProfile && (
                <Link href="/dashboard/projects/new" className="text-sm font-medium text-primary hover:underline">
                  Post a project
                </Link>
              )}
            />
          )}
        </ProfileCard>

        {reviewCount > 0 && (
          <ProfileCard title="Reviews from Freelancers" icon={<Star className="size-5" />}>
            <p className="text-sm text-muted-foreground">
              {reviewCount} review{reviewCount === 1 ? "" : "s"} from freelancers
            </p>
          </ProfileCard>
        )}
      </div>

      {/* ── Right: profile completion card (1 col) ── */}
      {isOwnProfile && (
        <div className="lg:col-span-1">
          <ProfileCompletionCard onEdit={onEdit} data={data} kycStatus={verificationStatus} />
        </div>
      )}
    </div>
  );
}