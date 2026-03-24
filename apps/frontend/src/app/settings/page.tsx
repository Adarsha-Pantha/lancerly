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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {TABS.filter((t) => {
              if (t.id === "payments") return user?.role === "FREELANCER";
              if (t.id === "subscription") return user?.role === "CLIENT";
              return true;
            }).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-[#6b26d9] text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                      {settings.profile?.avatarUrl ? (
                        <img
                          src={`${API_BASE}${settings.profile.avatarUrl}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-muted-foreground" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      <Camera size={14} />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Profile photo</p>
                    <p className="text-sm text-muted-foreground">JPEG, PNG, GIF or WebP. Max 5MB.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                    <Input
                      value={profileForm.name ?? ""}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your display name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Headline</label>
                    <Input
                      value={profileForm.headline ?? ""}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      placeholder="e.g. Full-stack Developer | React & Node.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                    <textarea
                      value={profileForm.bio ?? ""}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Tell others about yourself"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Skills</label>
                    <Input
                      value={(profileForm.skills ?? []).join(", ")}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g. React, Node.js, TypeScript (comma-separated)"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                      <Input
                        value={profileForm.country ?? ""}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        placeholder="Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                      <Input
                        value={profileForm.city ?? ""}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">State/Region</label>
                      <Input
                        value={profileForm.state ?? ""}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Timezone</label>
                    <Input
                      value={profileForm.timezone ?? ""}
                      onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                      placeholder="e.g. America/New_York"
                    />
                  </div>
                  <Button onClick={handleProfileUpdate} disabled={saving}>
                    <Save size={16} />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage password and two-factor authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFA}
                      onChange={(e) => setSettings({ ...settings, twoFA: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Current password"
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="New password"
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />
                    </div>
                    <Button onClick={handlePasswordUpdate} disabled={saving}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payments" && user?.role === "FREELANCER" && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Connect Stripe to receive payments</CardDescription>
              </CardHeader>
              <CardContent>
                {stripeStatus?.connected && stripeStatus?.chargesEnabled ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <span className="font-medium">Stripe connected</span>
                  </div>
                ) : (
                  <Button onClick={handleConnectStripe} disabled={stripeLoading}>
                    {stripeLoading ? "Redirecting…" : (
                      <>
                        Connect Stripe
                        <ExternalLink size={16} />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "subscription" && user?.role === "CLIENT" && (
            <SubscriptionSection />
          )}

          {activeTab === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Preferences</CardTitle>
                <CardDescription>Control your visibility and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "availability" as const, label: "Availability", desc: "Show you're available for projects", value: settings.availability },
                  { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive account updates", value: settings.emailNotifications },
                  { key: "profileVisibility" as const, label: "Profile Visibility", desc: "Make profile visible to others", value: settings.profileVisibility },
                ].map(({ key, label, desc, value }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <h3 className="font-medium text-foreground">{label}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
                <Button onClick={handleSettingsUpdate} disabled={saving}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "danger" && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>This action cannot be undone. Your data will be anonymized.</CardDescription>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                    I want to delete my account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                      <Input
                        type={showPasswords.delete ? "text" : "password"}
                        value={deleteForm.password}
                        onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                        placeholder="Your password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Type DELETE to confirm</label>
                      <Input
                        value={deleteForm.confirmation}
                        onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                        placeholder="DELETE"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteForm({ password: "", confirmation: "" });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={saving || deleteForm.confirmation !== "DELETE" || !deleteForm.password}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
