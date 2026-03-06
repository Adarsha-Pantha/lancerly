"use client";

import Link from "next/link";
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
  onEdit?: () => void;
  onContact?: () => void;
  onMessage?: () => void;
  messageLoading?: boolean;
  onSaveBio?: (bio: string) => Promise<void>;
  // Placeholder stats (can be wired to real data later)
  postedJobs?: number;
  totalSpending?: number;
  verificationStatus?: "verified" | "pending" | "unverified";
  reviewCount?: number;
};

export function ClientProfile({
  data,
  fallbackAvatar,
  toPublicUrl,
  isOwnProfile,
  onEdit,
  onContact,
  onMessage,
  messageLoading,
  onSaveBio,
  postedJobs = 0,
  totalSpending,
  verificationStatus = "unverified",
  reviewCount = 0,
}: ClientProfileProps) {
  const location = [data.city, data.country].filter(Boolean).join(", ");
  const joinedDate = data.createdAt
    ? `Joined ${new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`
    : undefined;

  return (
    <div className="space-y-6">
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
        primaryCta={
          !isOwnProfile && onMessage
            ? { label: "Message", onClick: onMessage, loading: messageLoading }
            : undefined
        }
        secondaryCta={
          !isOwnProfile && onContact ? { label: "Contact", onClick: onContact } : undefined
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {verificationStatus === "verified" && (
          <div className="rounded-xl border border-[#059669]/20 bg-[#059669]/5 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#059669] mb-1">
              <ShieldCheck className="size-4" />
              <span className="text-xs font-medium">Verified</span>
            </div>
            <p className="text-sm font-medium text-[#059669]">
              Identity verified
            </p>
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
            <p className="text-lg font-semibold text-foreground">
              ${totalSpending.toLocaleString()}
            </p>
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
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {data.bio}
            </p>
          ) : (
            <EmptyState
              title="No description yet"
              description="Share a bit about your company or what you&apos;re looking for"
              action={isOwnProfile && onEdit && (
                <button
                  onClick={onEdit}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Add description
                </button>
              )}
            />
          )}
        </ProfileCard>
      )}

      {/* Posted Jobs placeholder */}
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
              <Link
                href="/projects/new"
                className="text-sm font-medium text-primary hover:underline"
              >
                Post a project
              </Link>
            )}
          />
        )}
      </ProfileCard>

      {/* Reviews from freelancers placeholder */}
      {reviewCount > 0 && (
        <ProfileCard title="Reviews from Freelancers" icon={<Star className="size-5" />}>
          <p className="text-sm text-muted-foreground">
            {reviewCount} review{reviewCount === 1 ? "" : "s"} from freelancers
          </p>
        </ProfileCard>
      )}
    </div>
  );
}
