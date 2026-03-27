"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { get, put, post, postForm } from "@/lib/api";
import {
  User,
  Shield,
  Mail,
  CreditCard,
  Globe,
  Trash2,
  Save,
  Camera,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import Footer from "@/components/Footer";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

type ProfileData = {
  name: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
  timezone: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  availability: boolean;
  avatarUrl: string | null;
};

type SettingsData = {
  email: string;
  twoFA: boolean;
  availability: boolean;
  emailNotifications: boolean;
  profileVisibility: boolean;
  pendingEmail: string | null;
  profile: ProfileData;
};

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Globe },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<ProfileData>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [deleteForm, setDeleteForm] = useState({ password: "", confirmation: "" });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    email: false,
    delete: false,
  });
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; chargesEnabled?: boolean } | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as any;
      if (tab && TABS.some(t => t.id === tab)) {
        setActiveTab(tab);
      }
    }
    
    if (!token) {
      router.replace("/login");
      return;
    }
    loadSettings();
  }, [token, router]);

  const loadSettings = async () => {
    try {
      const data = await get<SettingsData>("/settings", token ?? undefined);
      setSettings(data);
      setProfileForm({
        name: data.profile?.name ?? "",
        headline: data.profile?.headline ?? "",
        bio: data.profile?.bio ?? "",
        skills: Array.isArray(data.profile?.skills) ? data.profile.skills : [],
        timezone: data.profile?.timezone ?? "",
        country: data.profile?.country ?? "",
        city: data.profile?.city ?? "",
        state: data.profile?.state ?? "",
      });
      if (user?.role === "FREELANCER") {
        try {
          const status = await get<{ connected: boolean; chargesEnabled?: boolean }>(
            "/stripe/connect/status",
            token ?? undefined
          );
          setStripeStatus(status);
        } catch {
          setStripeStatus({ connected: false });
        }
      }
    } catch {
      toast.toast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    try {
      const { url } = await post<{ url: string }>("/stripe/connect/onboarding-link", {}, token ?? undefined);
      window.location.href = url;
    } catch (e) {
      toast.toast((e as Error).message || "Failed to start Stripe onboarding", "error");
      setStripeLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      await put("/settings/profile", profileForm, token ?? undefined);
      toast.toast("Profile updated successfully", "success");
      loadSettings();
    } catch (e) {
      toast.toast((e as Error).message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await put(
        "/settings",
        {
          twoFA: settings.twoFA,
          emailNotifications: settings.emailNotifications,
          profileVisibility: settings.profileVisibility,
          availability: settings.availability,
        },
        token ?? undefined
      );
      toast.toast("Settings updated successfully", "success");
    } catch (e) {
      toast.toast((e as Error).message || "Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.toast("New passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.toast("Password must be at least 8 characters", "error");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(passwordData.newPassword)) {
      toast.toast("Password must contain at least one letter and one number", "error");
      return;
    }
    setSaving(true);
    try {
      await put(
        "/settings/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token ?? undefined
      );
      toast.toast("Password updated successfully", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.toast((e as Error).message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      toast.toast("Please enter new email and current password", "error");
      return;
    }
    setSaving(true);
    try {
      await put(
        "/settings/email",
        { newEmail: emailForm.newEmail, password: emailForm.password },
        token ?? undefined
      );
      toast.toast("Verification email sent. Check your inbox.", "success");
      setEmailForm({ newEmail: "", password: "" });
      loadSettings();
    } catch (e) {
      toast.toast((e as Error).message || "Failed to request email change", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.toast("Invalid file type. Use JPEG, PNG, GIF, or WebP.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.toast("File must be under 5MB", "error");
      return;
    }
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      await postForm<{ avatarUrl: string }>("/settings/avatar", form, token ?? undefined);
      toast.toast("Profile image updated", "success");
      loadSettings();
    } catch (e) {
      toast.toast((e as Error).message || "Failed to upload image", "error");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteForm.confirmation !== "DELETE") {
      toast.toast("Type DELETE to confirm", "error");
      return;
    }
    if (!deleteForm.password) {
      toast.toast("Enter your password", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/settings/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ password: deleteForm.password, confirmation: deleteForm.confirmation }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete account");
      logout();
      router.replace("/login");
    } catch (e) {
      toast.toast((e as Error).message || "Failed to delete account", "error");
      setSaving(false);
    }
  };

  if (!token) return null;
  if (loading || !settings) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  type TabId = "profile" | "security" | "payments" | "subscription" | "privacy" | "danger";

  interface SidebarItem {
    id: TabId;
    label: string;
    icon: any;
    roles?: string[];
  }

  interface SidebarGroup {
    label: string;
    items: SidebarItem[];
  }

  const SIDEBAR_GROUPS: SidebarGroup[] = [
    {
      label: "Billing",
      items: [
        { id: "subscription", label: "Membership", icon: CreditCard, roles: ["CLIENT"] },
        { id: "payments", label: "Billing & Payments", icon: CreditCard, roles: ["FREELANCER"] },
      ]
    },
    {
      label: "User Settings",
      items: [
        { id: "profile", label: "My Profile", icon: User },
        { id: "security", label: "Password & Security", icon: Shield },
        { id: "privacy", label: "Privacy Settings", icon: Globe },
        { id: "danger", label: "Close Account", icon: Trash2 },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Minimalist Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <h1 className="text-5xl font-semibold text-slate-900 mb-8">Settings</h1>
            
            <div className="space-y-8">
              {SIDEBAR_GROUPS.map((group) => {
                const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(user?.role || ""));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.label}>
                    <h2 className="text-sm font-bold text-slate-900 mb-3 px-3 uppercase tracking-wider">{group.label}</h2>
                    <nav className="space-y-0.5">
                      {visibleItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-sm transition-all group relative",
                              isActive 
                                ? "text-slate-900 font-semibold" 
                                : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            <span className="relative z-10 transition-transform group-hover:translate-x-0.5">{item.label}</span>
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6b27d9] rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <header className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {TABS.find(t => t.id === activeTab)?.label || "Settings"}
              </h2>
            </header>

            <div className="space-y-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Account Card */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Account</h3>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#6b27d9] hover:border-[#6b27d9] transition-all"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="flex items-start gap-8">
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                            {settings.profile?.avatarUrl ? (
                              <img
                                src={`${API_BASE}${settings.profile.avatarUrl}`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={32} className="text-slate-300" />
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                          <div>
                            <p className="text-xs font-bold text-slate-900 mb-1">Name</p>
                            <p className="text-sm text-slate-600">{settings.profile?.name || "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 mb-1">Email</p>
                            <p className="text-sm text-slate-600">{settings.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Card */}
                  <div className="bg-white border border-slate-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900">Profile Details</h3>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-1.5 font-medium">
                          <label className="text-xs font-bold text-slate-900 uppercase">Headline</label>
                          <Input
                            value={profileForm.headline ?? ""}
                            onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                            placeholder="e.g. Senior Developer"
                            className="h-10 border-slate-200 focus:border-[#6b27d9] focus:ring-0 rounded-md"
                          />
                        </div>
                        <div className="space-y-1.5 font-medium">
                          <label className="text-xs font-bold text-slate-900 uppercase">Skills</label>
                          <Input
                            value={(profileForm.skills ?? []).join(", ")}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                              })
                            }
                            placeholder="React, Design..."
                            className="h-10 border-slate-200 focus:border-[#6b27d9] focus:ring-0 rounded-md"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1.5 font-medium">
                          <label className="text-xs font-bold text-slate-900 uppercase">Bio</label>
                          <textarea
                            value={profileForm.bio ?? ""}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            rows={4}
                            className="w-full border border-slate-200 focus:border-[#6b27d9] focus:ring-0 rounded-md p-3 text-sm"
                            placeholder="Tell your story..."
                          />
                        </div>
                        <div className="space-y-1.5 font-medium">
                          <label className="text-xs font-bold text-slate-900 uppercase">Country</label>
                          <Input
                            value={profileForm.country ?? ""}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            className="h-10 border-slate-200 rounded-md"
                          />
                        </div>
                        <div className="space-y-1.5 font-medium">
                          <label className="text-xs font-bold text-slate-900 uppercase">City</label>
                          <Input
                            value={profileForm.city ?? ""}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            className="h-10 border-slate-200 rounded-md"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button 
                          onClick={handleProfileUpdate} 
                          disabled={saving}
                          className="bg-white border border-[#6b27d9] text-[#6b27d9] hover:bg-[#6b27d9] hover:text-white px-6 rounded-md font-bold transition-all"
                        >
                          {saving ? "Saving..." : "Update Profile"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-lg p-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Password & Security</h3>
                    <div className="space-y-8 max-w-md">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase">Current Password</label>
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="h-10 border-slate-200 rounded-md"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase">New Password</label>
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="h-10 border-slate-200 rounded-md"
                        />
                      </div>
                      <Button 
                        onClick={handlePasswordUpdate} 
                        disabled={saving}
                        className="bg-[#6b27d9] text-white px-6 rounded-md font-bold"
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payments" && user?.role === "FREELANCER" && (
                <div className="bg-white border border-slate-200 rounded-lg p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Billing & Payments</h3>
                  <div className="p-8 border border-slate-100 rounded-lg text-center space-y-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <CreditCard size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900">
                      {stripeStatus?.connected ? "Stripe Connected" : "No payment method connected"}
                    </h4>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      {stripeStatus?.connected 
                        ? "Your account is ready to receive payouts." 
                        : "Connect your Stripe account to start receiving payments for your work."}
                    </p>
                    {!stripeStatus?.connected && (
                      <Button 
                        onClick={handleConnectStripe} 
                        disabled={stripeLoading}
                        className="bg-[#6b27d9] text-white px-8 rounded-md font-bold mt-4"
                      >
                        {stripeLoading ? "Loading..." : "Setup Stripe"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "subscription" && user?.role === "CLIENT" && (
                <SubscriptionSection />
              )}

              {activeTab === "privacy" && (
                <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-8">
                  <h3 className="text-lg font-semibold text-slate-900">Privacy Settings</h3>
                  <div className="space-y-4">
                    {[
                      { key: "availability" as const, label: "Availability Status", desc: "Show you're available for projects", value: settings.availability },
                      { key: "emailNotifications" as const, label: "Email Updates", desc: "Receive updates about your account", value: settings.emailNotifications },
                    ].map(({ key, label, desc, value }) => (
                      <div key={key} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#6b27d9] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleSettingsUpdate} 
                    disabled={saving}
                    className="bg-[#6b27d9] text-white px-6 rounded-md font-bold"
                  >
                    Save Privacy
                  </Button>
                </div>
              )}

              {activeTab === "danger" && (
                <div className="bg-white border border-rose-200 rounded-lg p-8">
                  <h3 className="text-lg font-semibold text-rose-600 mb-2">Close Account</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Be careful. This action is permanent.</p>
                  
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-rose-600 text-sm font-bold hover:underline"
                    >
                      Close my account
                    </button>
                  ) : (
                    <div className="space-y-6 max-w-sm">
                      <div className="space-y-1.5 font-medium">
                        <label className="text-xs font-bold text-slate-900">Confirm Password</label>
                        <Input
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                          className="h-10 border-slate-200 rounded-md"
                        />
                      </div>
                      <div className="flex gap-4 font-bold">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 rounded-md"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={saving || !deleteForm.password}
                          className="flex-1 rounded-md"
                        >
                          Close Account
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
