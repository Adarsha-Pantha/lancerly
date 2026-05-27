"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { X, Loader2, ExternalLink, UserPlus, Users } from "lucide-react";

type PublicProfile = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isFriend?: boolean;
  isOwnProfile?: boolean;
  profile?: {
    name: string | null;
    headline: string | null;
    bio: string | null;
    avatarUrl: string | null;
    country: string | null;
    city: string | null;
  } | null;
};

export function UserProfilePanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await get<PublicProfile>(`/profile/${userId}`, token || undefined);
        if (mounted) setProfile(data);
      } catch {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, token]);

  async function addFriend() {
    if (!token) return;
    setFriendLoading(true);
    try {
      await post(`/friends/request/${userId}`, {}, token);
      const data = await get<PublicProfile>(`/profile/${userId}`, token);
      setProfile(data);
    } finally {
      setFriendLoading(false);
    }
  }

  const name = profile?.profile?.name || "User";
  const avatar =
    toPublicUrl(profile?.profile?.avatarUrl) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close profile panel"
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-black text-slate-900">Profile</p>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-violet-600" />
          </div>
        ) : !profile ? (
          <div className="p-6 text-sm text-slate-600">Profile not found.</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt={name}
                className="size-14 rounded-2xl border border-slate-200 object-cover"
              />
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-900 truncate">{name}</p>
                {profile.profile?.headline && (
                  <p className="text-sm text-slate-600 mt-1 leading-snug">{profile.profile.headline}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wider">{profile.role}</p>
              </div>
            </div>

            {profile.profile?.bio && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">About</p>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                  {profile.profile.bio}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/users/${userId}`}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={onClose}
              >
                <ExternalLink className="size-4" />
                Open full profile
              </Link>

              {token && !profile.isOwnProfile &&
                (profile.isFriend ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-700">
                    <Users className="size-4" />
                    Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={addFriend}
                    disabled={friendLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
                  >
                    {friendLoading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    Add friend
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

