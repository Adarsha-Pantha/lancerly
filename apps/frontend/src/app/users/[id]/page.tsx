"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import {
  User,
  UserPlus,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Loader2,
  ArrowLeft,
  Check,
  Edit,
  Sparkles,
} from "lucide-react";

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
    skills: any;
    avatarUrl: string | null;
    dob: string | null;
    country: string | null;
    city: string | null;
    state: string | null;
    availability: boolean | null;
  } | null;
};

export default function UserProfilePage() {
  const { user: currentUser, token, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (userId && userId.trim()) {
      loadProfile();
    } else {
      setLoading(false);
      setProfile(null);
    }
  }, [userId, token]);

  async function loadProfile() {
    if (!userId || !userId.trim()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Loading profile for userId:", userId);
      const data = await get<PublicProfile>(`/profile/${userId}`, token);
      console.log("Profile loaded:", data);
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      const msg = String(err?.message || "").toLowerCase();
      
      // Check for "not found" first (before auth errors)
      if (msg.includes("not found") || msg.includes("404")) {
        // User doesn't exist - show error message
        console.log("User not found for ID:", userId);
        setProfile(null);
        return;
      }
      
      // Check for authentication errors (but NOT "user not found")
      const authErrors = ["unauthorized", "token", "expired", "missing token", "invalid token"];
      if (authErrors.some((p) => msg.includes(p)) && !msg.includes("not found")) {
        console.log("Authentication error, redirecting to login");
        if (token) logout();
        router.replace("/login");
        return;
      }
      
      // Other errors
      console.error("Unexpected error loading profile:", err);
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
      // Reload profile to update isFriend status
      await loadProfile();
    } catch (err: any) {
      console.error("Failed to add friend:", err);
      alert(err?.message || "Failed to add friend");
    } finally {
      setAddingFriend(false);
    }
  }

  async function startConversation() {
    if (!token || !profile) return;
    try {
      // Ensure they are friends first
      if (!profile.isFriend) {
        await addFriend();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Find or create conversation
      const conversations = await get<Array<{ id: string; participant: { id: string } }>>("/conversations", token);
      const conversation = conversations.find(
        conv => conv.participant.id === userId
      );
      
      if (conversation) {
        router.push(`/messages/${conversation.id}`);
      } else {
        const newConversation = await post<{ id: string }>("/conversations", {
          freelancerId: userId,
        }, token);
        router.push(`/messages/${newConversation.id}`);
      }
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
      alert(err?.message || "Failed to start conversation");
    }
  }

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.profile?.name || "User")}`;
  const skills = profile?.profile?.skills ? (Array.isArray(profile.profile.skills) ? profile.profile.skills : []) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-600 mb-4">Profile not found</p>
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // If viewing own profile, redirect to /profile
  if (profile.isOwnProfile) {
    router.replace("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={toPublicUrl(profile.profile?.avatarUrl) || fallbackAvatar}
              alt={profile.profile?.name || "User"}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-purple-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile.profile?.name || "User"}
                </h1>
                {profile.isFriend && (
                  <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-full flex items-center gap-1">
                    <Check size={14} />
                    Friend
                  </span>
                )}
              </div>
              {profile.profile?.headline && (
                <p className="text-lg text-slate-600 mb-3">{profile.profile.headline}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {profile.profile?.city && profile.profile?.country && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.profile.city}, {profile.profile.country}</span>
                  </div>
                )}
                {profile.profile?.dob && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Briefcase size={16} />
                  <span className="capitalize">{profile.role.toLowerCase()}</span>
                </div>
              </div>
            </div>
            {token && !profile.isOwnProfile && (
              <div className="flex gap-3">
                {profile.isFriend ? (
                  <button
                    onClick={startConversation}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Message
                  </button>
                ) : (
                  <button
                    onClick={addFriend}
                    disabled={addingFriend}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {addingFriend ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Add Friend
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-600" size={20} />
              <h2 className="text-xl font-semibold text-slate-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} />
              <span>{profile.email}</span>
            </div>
            {profile.profile?.availability !== null && (
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.profile.availability
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {profile.profile.availability ? "Available for work" : "Not available"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

