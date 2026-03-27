"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { needsCompletion } from "@/lib/auth";
import { get, put, putForm, postForm } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  FreelancerProfile,
  ClientProfile,
  ProfileHeaderSkeleton,
} from "@/components/profile";
import { PortfolioUploadModal } from "@/components/profile/PortfolioUploadModal";

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
    hourlyRate?: number | null;
    isComplete?: boolean | null;
    kycStatus?: string | null;
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
  postedJobs?: number;
  totalSpending?: number;
  reviewCount?: number;
  rating?: number;
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
    _count?: { proposals: number };
    contract?: {
      review?: { rating: number; comment: string | null } | null;
    } | null;
  }[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;
    try {
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
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const initialized = useRef(false);

  useEffect(() => {
    // If not authenticated yet, return and wait for token
    if (!token || initialized.current) return;
    
    initialized.current = true;
    (async () => {
      try {
        await fetchProfile();
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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

  const handleUpdateProfile = async (update: any) => {
    if (!token) return;
    try {
      await put("/settings/profile", update, token);
      await fetchProfile();
      await refreshUser(); // Synchronize global AuthContext (Navbar, etc.)
      toast.toast("Profile updated", "success");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.toast("Failed to update profile", "error");
      throw err;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await putForm("/profile", formData, token);
      await fetchProfile();
      await refreshUser();
      toast.toast("Avatar updated", "success");
    } catch (err) {
      console.error("Avatar upload failed", err);
      toast.toast("Failed to update avatar", "error");
      throw err;
    }
  };

  const handlePortfolioUpload = async (formData: FormData) => {
    if (!token) return;
    try {
      await postForm("/profile/portfolio", formData, token);
      await fetchProfile();
      await refreshUser();
      toast.toast("Portfolio project added", "success");
    } catch (err) {
      console.error("Portfolio upload failed", err);
      toast.toast("Failed to add portfolio", "error");
      throw err;
    }
  };

  const handleSaveBio = async (bio: string) => {
    await handleUpdateProfile({ bio });
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
          onUpdate={handleUpdateProfile}
          onEdit={handleEdit}
          onAvatarUpload={handleAvatarUpload}
          onSaveBio={handleSaveBio}
          verificationStatus={profile?.kycStatus === "APPROVED" ? "verified" : (profile?.kycStatus === "PENDING" ? "pending" : "unverified")}
          postedJobs={profileData?.postedJobs}
          totalSpending={profileData?.totalSpending}
          reviewCount={profileData?.reviewCount}
          rating={profileData?.rating}
          projects={profileData?.projects}
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
          hourlyRate: profile?.hourlyRate,
          totalEarnings: profileData?.earnings?.totalEarnings,
          paymentHistory: profileData?.earnings?.paymentHistory,
        }}
        fallbackAvatar={fallbackAvatar}
        toPublicUrl={toPublicUrl}
        isOwnProfile
        onUpdate={handleUpdateProfile}
        onEdit={handleEdit}
        onAvatarUpload={handleAvatarUpload}
        onSaveBio={handleSaveBio}
        kycStatus={profile?.kycStatus === "APPROVED" ? "verified" : (profile?.kycStatus === "PENDING" ? "pending" : "unverified")}
        portfolioProjects={profileData?.portfolioProjects}
        onAddPortfolio={() => setIsPortfolioModalOpen(true)}
      />
      
      <PortfolioUploadModal
        open={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        onSubmit={handlePortfolioUpload}
      />
    </div>
  );
}
