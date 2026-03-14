"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { needsCompletion } from "@/lib/auth";
import { get, put } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  FreelancerProfile,
  ClientProfile,
  ProfileHeaderSkeleton,
} from "@/components/profile";

type ProfileData = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    name?: string | null;
    headline?: string | null;
    bio?: string | null;
    skills?: string[];
    avatarUrl?: string | null;
    country?: string | null;
    city?: string | null;
    state?: string | null;
    availability?: boolean | null;
    isComplete?: boolean | null;
  } | null;
  earnings?: {
    totalEarnings: number;
    paymentHistory: {
      id: string;
      amount: number;
      projectTitle: string;
      date: string;
    }[];
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
        if (token) {
          const data = await get<ProfileData>("/profile/me", token);
          
          if (data.role === "FREELANCER") {
            try {
              const earnings = await get<ProfileData["earnings"]>("/stripe/earnings", token);
              data.earnings = earnings;
            } catch (e) {
              console.error("Failed to fetch earnings", e);
            }
          }
          
          setProfileData(data);
        }
      } catch {
        // Profile endpoint might not be available
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser, token]);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!loading || !token) return;
    if (needsCompletion(user)) {
      router.replace("/profile/setup");
    }
  }, [loading, token, user, router]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <ProfileHeaderSkeleton />
        <div className="grid gap-6">
          <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  const role = profileData?.role || user?.role || "FREELANCER";
  const profile = profileData?.profile;
  const name = profile?.name || user?.name || "User";
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  const handleEdit = () => router.push("/profile/edit");

  const handleSaveBio = async (bio: string) => {
    await put("/settings/profile", { bio }, token ?? undefined);
    const data = await get<ProfileData>("/profile/me", token);
    setProfileData(data);
    toast.toast("Bio updated", "success");
  };

  if (role === "CLIENT") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ClientProfile
          data={{
            name,
            headline: profile?.headline,
            bio: profile?.bio,
            avatarUrl: profile?.avatarUrl,
            createdAt: profileData?.createdAt,
            country: profile?.country,
            city: profile?.city,
          }}
          fallbackAvatar={fallbackAvatar}
          toPublicUrl={toPublicUrl}
          isOwnProfile
          onEdit={handleEdit}
          onSaveBio={handleSaveBio}
          verificationStatus={(profile?.isComplete ?? user?.isComplete) ? "verified" : "unverified"}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <FreelancerProfile
        data={{
          name,
          headline: profile?.headline,
          bio: profile?.bio,
          skills: Array.isArray(profile?.skills) ? profile.skills : [],
          avatarUrl: profile?.avatarUrl,
          availability: profile?.availability ?? true,
          createdAt: profileData?.createdAt,
          country: profile?.country,
          city: profile?.city,
          totalEarnings: profileData?.earnings?.totalEarnings,
          paymentHistory: profileData?.earnings?.paymentHistory,
        }}
        fallbackAvatar={fallbackAvatar}
        toPublicUrl={toPublicUrl}
        isOwnProfile
        onEdit={handleEdit}
        onSaveBio={handleSaveBio}
      />
    </div>
  );
}
