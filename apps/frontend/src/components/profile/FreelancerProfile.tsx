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
} from "lucide-react";

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
};

type FreelancerProfileProps = {
  data: FreelancerProfileData;
  fallbackAvatar: string;
  toPublicUrl: (url?: string | null) => string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onHire?: () => void;
  onMessage?: () => void;
  messageLoading?: boolean;
  onSaveBio?: (bio: string) => Promise<void>;
  // Placeholder stats (can be wired to real data later)
  hourlyRate?: number | null;
  completedProjects?: number;
  rating?: number | null;
  reviewCount?: number;
};

export function FreelancerProfile({
  data,
  fallbackAvatar,
  toPublicUrl,
  isOwnProfile,
  onEdit,
  onHire,
  onMessage,
  messageLoading,
  onSaveBio,
  hourlyRate,
  completedProjects = 0,
  rating,
  reviewCount = 0,
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
    <div className="space-y-6">
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
        primaryCta={
          !isOwnProfile && onHire
            ? { label: "Hire", onClick: onHire, loading: messageLoading }
            : undefined
        }
        secondaryCta={
          !isOwnProfile && onMessage ? { label: "Message", onClick: onMessage } : undefined
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {hourlyRate != null && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="size-4" />
              <span className="text-xs font-medium">Hourly Rate</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              ${hourlyRate}/hr
            </p>
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="size-4" />
            <span className="text-xs font-medium">Availability</span>
          </div>
          <p
            className={`text-sm font-medium ${
              data.availability ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            }`}
          >
            {data.availability ? "Available" : "Not available"}
          </p>
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

      {/* Portfolio placeholder */}
      <ProfileCard title="Portfolio" icon={<FolderKanban className="size-5" />}>
        <EmptyState
          icon={<FolderKanban className="size-8" />}
          title="No portfolio yet"
          description="Add your best work to show clients what you can do"
          action={isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="text-sm font-medium text-primary hover:underline"
            >
              Add portfolio
            </button>
          )}
        />
      </ProfileCard>

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
  );
}
