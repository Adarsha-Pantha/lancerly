"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { get, put, postForm } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
  avatarUrl: string | null;
};

export default function EditProfilePage() {
  const { token } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    headline: "",
    bio: "",
    skills: [],
    timezone: "",
    country: "",
    city: "",
    state: "",
    avatarUrl: null,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    loadSettings();
  }, [token, router]);

  async function loadSettings() {
    try {
      const data = await get<{ profile: ProfileData }>("/settings", token ?? undefined);
      const p = data.profile;
      setForm({
        name: p?.name ?? "",
        headline: p?.headline ?? "",
        bio: p?.bio ?? "",
        skills: Array.isArray(p?.skills) ? p.skills : [],
        timezone: p?.timezone ?? "",
        country: p?.country ?? "",
        city: p?.city ?? "",
        state: p?.state ?? "",
        avatarUrl: p?.avatarUrl ?? null,
      });
    } catch {
      toast.toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await put(
        "/settings/profile",
        {
          name: form.name,
          headline: form.headline || undefined,
          bio: form.bio || undefined,
          skills: form.skills.length ? form.skills : undefined,
          timezone: form.timezone || undefined,
          country: form.country || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
        },
        token ?? undefined
      );
      toast.toast("Profile updated successfully", "success");
      router.push("/profile");
    } catch (e) {
      toast.toast((e as Error).message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.toast("Invalid file type. Use JPEG, PNG, GIF, or WebP.", "error");
      return;
    }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await postForm<{ avatarUrl: string }>("/settings/avatar", fd, token ?? undefined);
      setForm((f) => ({ ...f, avatarUrl: res?.avatarUrl ?? null }));
      toast.toast("Profile photo updated", "success");
    } catch (e) {
      toast.toast((e as Error).message || "Failed to upload image", "error");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  if (!token) return null;

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Profile
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your public profile. Changes are visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                  {form.avatarUrl ? (
                    <img
                      src={toPublicUrl(form.avatarUrl) || `${API_BASE}${form.avatarUrl}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-muted-foreground" size={32} />
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
                  type="button"
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
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, GIF or WebP. Max 5MB.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Headline
              </label>
              <Input
                value={form.headline ?? ""}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Full-stack Developer | React & Node.js"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bio
              </label>
              <textarea
                value={form.bio ?? ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tell others about yourself and your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Skills
              </label>
              <Input
                value={form.skills.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Country
                </label>
                <Input
                  value={form.country ?? ""}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  City
                </label>
                <Input
                  value={form.city ?? ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  State/Region
                </label>
                <Input
                  value={form.state ?? ""}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Timezone
              </label>
              <Input
                value={form.timezone ?? ""}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                placeholder="e.g. America/New_York"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                <Save size={16} />
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
