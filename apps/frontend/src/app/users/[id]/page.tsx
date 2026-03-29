"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  FreelancerProfile,
  ClientProfile,
  ProfileHeaderSkeleton,
} from "@/components/profile";
import { ArrowLeft, Loader2 } from "lucide-react";

type PublicProfile = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isFriend: boolean;
  isOwnProfile: boolean;
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
  } | null;
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

export default function UserProfilePage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (userId?.trim()) {
      loadProfile();
    } else {
      setLoading(false);
      setProfile(null);
    }
  }, [userId, token]);

  async function loadProfile() {
    if (!userId?.trim()) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await get<PublicProfile>(`/profile/${userId}`, token || undefined);
      setProfile(data);
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
  }

  async function addFriend() {
    if (!token || addingFriend || !profile) return;
    try {
      setAddingFriend(true);
      await post(`/friends/${userId}`, {}, token);
      await loadProfile();
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to add friend");
    } finally {
      setAddingFriend(false);
    }
  }

  async function startConversation() {
    if (!token || !profile) return;
    try {
      if (!profile.isFriend) {
        await addFriend();
        await new Promise((r) => setTimeout(r, 500));
      }
      const conversations = await get<Array<{ id: string; participant: { id: string } }>>(
        "/conversations",
        token
      );
      const conv = conversations.find((c) => c.participant.id === userId);
      if (conv) {
        router.push(`/messages/${conv.id}`);
      } else {
        const newConv = await post<{ id: string }>(
          "/conversations",
          { freelancerId: userId },
          token
        );
        router.push(`/messages/${newConv.id}`);
      }
    } catch (err: unknown) {
      alert((err as Error)?.message || "Failed to start conversation");
    }
  }

  const skills = profile?.profile?.skills
    ? Array.isArray(profile.profile.skills)
      ? profile.profile.skills
      : []
    : [];
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.profile?.name || "User")}`;

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
        <ProfileHeaderSkeleton />
        <div className="grid gap-6">
          <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <Link href="/" className="text-primary hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  if (profile.isOwnProfile) {
    router.replace("/profile");
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const name = profile.profile?.name || "User";
  const role = profile.role || "FREELANCER";

  const handleHire = () => {
    // For freelancers: Hire could start a project or open invite flow
    startConversation();
  };

  const handleMessage = () => {
    startConversation();
  };

  if (role === "CLIENT") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
        <ClientProfile
          data={{
            name,
            headline: profile.profile?.headline,
            bio: profile.profile?.bio,
            avatarUrl: profile.profile?.avatarUrl,
            createdAt: profile.createdAt,
            country: profile.profile?.country,
            city: profile.profile?.city,
          }}
          fallbackAvatar={fallbackAvatar}
          toPublicUrl={toPublicUrl}
          isOwnProfile={false}
          onMessage={token ? handleMessage : undefined}
          onContact={token ? handleMessage : undefined}
          messageLoading={addingFriend}
          projects={profile.projects}
          userId={profile.id}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </Link>
      <FreelancerProfile
        data={{
          name,
          headline: profile.profile?.headline,
          bio: profile.profile?.bio,
          skills,
          avatarUrl: profile.profile?.avatarUrl,
          availability: profile.profile?.availability ?? true,
          createdAt: profile.createdAt,
          country: profile.profile?.country,
          city: profile.profile?.city,
        }}
        fallbackAvatar={fallbackAvatar}
        toPublicUrl={toPublicUrl}
        isOwnProfile={false}
        onHire={token ? handleHire : undefined}
        onMessage={token ? handleMessage : undefined}
        messageLoading={addingFriend}
        projects={profile.projects}
        userId={profile.id}
      />
    </div>
  );
}
