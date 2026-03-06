"use client";

import { cn } from "@/lib/utils";
import { Briefcase, User, Pencil, MapPin, Calendar } from "lucide-react";

type ProfileHeaderProps = {
  name: string;
  headline?: string | null;
  avatarUrl?: string | null;
  role: string;
  location?: string;
  joinedDate?: string;
  fallbackAvatar: string;
  toPublicUrl: (url?: string | null) => string;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  primaryCta?: { label: string; onClick: () => void; loading?: boolean };
  secondaryCta?: { label: string; onClick: () => void };
  className?: string;
};

export function ProfileHeader({
  name,
  headline,
  avatarUrl,
  role,
  location,
  joinedDate,
  fallbackAvatar,
  toPublicUrl,
  isOwnProfile,
  onEdit,
  primaryCta,
  secondaryCta,
  className,
}: ProfileHeaderProps) {
  const RoleIcon = role === "CLIENT" ? Briefcase : User;
  const isClient = role === "CLIENT";

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <img
          src={toPublicUrl(avatarUrl) || fallbackAvatar}
          alt={name}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium shrink-0",
                isClient
                  ? "bg-[#0284C7]/10 text-[#0284C7]"
                  : "bg-primary/10 text-primary"
              )}
            >
              <RoleIcon className="size-4" />
              {isClient ? "Client" : "Freelancer"}
            </span>
          </div>
          {headline && (
            <p className="text-lg text-muted-foreground mb-3 line-clamp-2">
              {headline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                {location}
              </span>
            )}
            {joinedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                {joinedDate}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-foreground font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              <Pencil className="size-4" />
              Edit Profile
            </button>
          )}
          {!isOwnProfile && primaryCta && (
            <button
              onClick={primaryCta.onClick}
              disabled={primaryCta.loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white font-medium hover:bg-[#A78BFA] transition-colors shadow-[0_2px_8px_rgba(124,58,237,0.3)] disabled:opacity-50"
            >
              {primaryCta.loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Loading...
                </>
              ) : (
                primaryCta.label
              )}
            </button>
          )}
          {!isOwnProfile && secondaryCta && (
            <button
              onClick={secondaryCta.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-foreground font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
