"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Pencil,
  MapPin,
  Calendar,
  Camera,
  Star,
  ShieldCheck,
  Clock,
  MessageCircle,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";

export type ProfileHeaderProps = {
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
  onAvatarUpload?: (file: File) => Promise<void>;
  primaryCta?: { label: string; onClick: () => void; loading?: boolean };
  secondaryCta?: { label: string; onClick: () => void };
  className?: string;
  bannerVariant?: boolean;
  ratingSummary?: { rating: number; count: number } | null;
  verification?: "verified" | "pending" | "unverified" | null;
  availabilityHighlight?: boolean | null;
  children?: React.ReactNode;
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
  onAvatarUpload,
  primaryCta,
  secondaryCta,
  className,
  bannerVariant = false,
  ratingSummary,
  verification,
  availabilityHighlight,
  children,
}: ProfileHeaderProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isClient = role === "CLIENT";

  /* ── Avatar ── */
  const avatarBlock = (
    <div className="relative group shrink-0">
      <div className={cn(
        "p-[3px] rounded-[1.6rem]",
        isClient
          ? "bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-500"
          : "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500"
      )}>
        <img
          src={toPublicUrl(avatarUrl) || fallbackAvatar}
          alt={name}
          className={cn(
            "object-cover bg-white block",
            bannerVariant
              ? "h-[8.5rem] w-[8.5rem] sm:h-[9.5rem] sm:w-[9.5rem] rounded-[1.45rem]"
              : "h-24 w-24 rounded-full"
          )}
        />
      </div>
      {isOwnProfile && onAvatarUpload && (
        <button
          type="button"
          className={cn(
            "absolute inset-[3px] flex items-center justify-center cursor-pointer",
            "transition-all bg-black/50 text-white backdrop-blur-[2px]",
            bannerVariant ? "rounded-[1.45rem]" : "rounded-full",
            "opacity-0 group-hover:opacity-100",
            uploadingAvatar && "opacity-100"
          )}
          onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          aria-label="Change profile photo"
        >
          {uploadingAvatar
            ? <span className="size-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <div className="flex flex-col items-center gap-0.5">
                <Camera className="size-6 drop-shadow" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Change</span>
              </div>
          }
        </button>
      )}
      <input
        type="file" ref={fileInputRef} className="hidden" accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && onAvatarUpload) {
            setUploadingAvatar(true);
            try { await onAvatarUpload(file); }
            finally {
              setUploadingAvatar(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }
          }
        }}
      />
    </div>
  );

  /* ── Role badge ── */
  const roleBadge = (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 border",
      isClient
        ? "bg-cyan-50 text-cyan-800 border-cyan-200"
        : "bg-violet-50 text-violet-800 border-violet-200"
    )}>
      {isClient ? <Briefcase className="size-3.5" /> : <Sparkles className="size-3.5" />}
      {isClient ? "Client" : "Freelancer"}
    </span>
  );

  /* ── Meta chips ── */
  const chips: React.ReactNode[] = [];
  if (location) chips.push(
    <span key="loc" className="chip"><MapPin className="size-3 shrink-0 text-violet-500" />{location}</span>
  );
  if (joinedDate) chips.push(
    <span key="join" className="chip"><Calendar className="size-3 shrink-0 text-violet-500" />{joinedDate}</span>
  );
  if (ratingSummary && ratingSummary.count > 0) chips.push(
    <span key="rat" className="chip-amber">
      <Star className="size-3 shrink-0 text-amber-500 fill-amber-400" />
      {ratingSummary.rating.toFixed(1)} · {ratingSummary.count} review{ratingSummary.count !== 1 ? "s" : ""}
    </span>
  );
  if (verification === "verified") chips.push(
    <span key="vfy" className="chip-green"><ShieldCheck className="size-3 shrink-0" />Verified</span>
  );
  if (verification === "pending") chips.push(
    <span key="pend" className="chip-amber"><Clock className="size-3 shrink-0" />Verification pending</span>
  );
  if (!isClient && availabilityHighlight) chips.push(
    <span key="avail" className="chip-green font-bold">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Open to work
    </span>
  );

  /* ── Primary icon ── */
  const primaryIcon = primaryCta?.label.toLowerCase().includes("message")
    ? <MessageCircle className="size-4" />
    : primaryCta?.label.toLowerCase().includes("hire")
    ? <Zap className="size-4" />
    : <UserPlus className="size-4" />;

  /* ── Banner variant ── */
  if (bannerVariant) {
    return (
      <div className={cn("rounded-[2rem] overflow-hidden shadow-[0_24px_64px_-16px_rgba(91,33,182,0.3)] border border-slate-200/70 bg-white", className)}>

        {/* Decorative banner — pure visual, no text inside */}
        <div className={cn(
          "relative h-[120px] sm:h-[160px] w-full overflow-hidden",
          isClient ? "profile-banner-client" : "profile-banner-freelancer"
        )}>
          <div className="profile-orb-1 absolute -top-8 -left-8 size-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="profile-orb-2 absolute -bottom-6 right-6 size-36 rounded-full bg-fuchsia-300/20 blur-2xl pointer-events-none" />
          <div className="profile-orb-3 absolute top-3 right-1/3 size-28 rounded-full bg-amber-300/15 blur-xl pointer-events-none" />
          <div className="profile-banner-noise absolute inset-0 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Main info row — all text here, clearly readable on white */}
        <div className="px-5 sm:px-8 pb-7 sm:pb-8 pt-0 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-[4rem] sm:-mt-[4.5rem]">
            {/* Avatar */}
            {avatarBlock}

            {/* Name + headline + actions */}
            <div className="flex-1 min-w-0 pt-1 sm:pt-0 sm:pb-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: name + badge + headline */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight leading-tight">
                      {name}
                    </h1>
                    {roleBadge}
                  </div>
                  {headline && (
                    <p className="text-sm sm:text-base text-slate-600 leading-snug max-w-xl mt-1">
                      {headline}
                    </p>
                  )}
                </div>

                {/* Right: action buttons */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {isOwnProfile && onEdit && (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      <Pencil className="size-4" />
                      Edit profile
                    </button>
                  )}
                  {!isOwnProfile && primaryCta && (
                    <button
                      type="button"
                      onClick={primaryCta.onClick}
                      disabled={primaryCta.loading}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-lg transition-all",
                        "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:brightness-110 active:scale-[0.97] disabled:opacity-60",
                        "shadow-[0_6px_20px_-4px_rgba(109,40,217,0.5)]"
                      )}
                    >
                      {primaryCta.loading
                        ? <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Loading…</>
                        : <>{primaryIcon}<span className="font-semibold">{primaryCta.label}</span></>}
                    </button>
                  )}
                  {!isOwnProfile && secondaryCta && (
                    <button
                      type="button"
                      onClick={secondaryCta.onClick}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-violet-200 bg-violet-50 text-violet-800 font-bold text-sm hover:bg-violet-100 transition-all"
                    >
                      <MessageCircle className="size-4" />
                      {secondaryCta.label}
                    </button>
                  )}
                </div>
              </div>

              {/* Meta chips row */}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {chips}
                </div>
              )}

              {/* Children (extra actions like Copy link, Add friend) */}
              {children && (
                <div className="flex flex-wrap gap-2 mt-3">{children}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Flat variant ── */
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-warm-md", className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div>{avatarBlock}</div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold font-display text-foreground tracking-tight">{name}</h1>
            {roleBadge}
          </div>
          {headline && <p className="text-base text-muted-foreground leading-snug">{headline}</p>}
          <div className="flex flex-wrap gap-2">{chips}</div>
          {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {isOwnProfile && onEdit && (
            <button type="button" onClick={onEdit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-violet-200 bg-violet-50 text-violet-900 font-bold text-sm hover:bg-violet-100 transition-all">
              <Pencil className="size-4" />Edit profile
            </button>
          )}
          {!isOwnProfile && primaryCta && (
            <button type="button" onClick={primaryCta.onClick} disabled={primaryCta.loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm shadow-[0_8px_28px_-4px_rgba(109,40,217,0.45)] hover:brightness-110 transition-all disabled:opacity-50">
              {primaryIcon}{primaryCta.label}
            </button>
          )}
          {!isOwnProfile && secondaryCta && (
            <button type="button" onClick={secondaryCta.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-violet-200 bg-violet-50 text-violet-900 font-bold text-sm hover:bg-violet-100 transition-all">
              <MessageCircle className="size-4" />{secondaryCta.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
