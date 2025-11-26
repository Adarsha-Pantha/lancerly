"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, putForm } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { Camera, ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import AnimatedButton from "@/components/ui/AnimatedButton";

export default function EditProfilePage() {
  const { token, refreshUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostal] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const me = await get<{ user: any }>("/auth/me", token);
        const u = me?.user;
        setName(u?.name ?? "");
        setDob(u?.dob ? String(u.dob).slice(0, 10) : "");
        setCountry(u?.country ?? "");
        setPhone(u?.phone ?? "");
        setStreet(u?.street ?? "");
        setCity(u?.city ?? "");
        setStateVal(u?.state ?? "");
        setPostal(u?.postalCode ?? "");
        setAvatarPreview(u?.avatarUrl ? toPublicUrl(u.avatarUrl) : "");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : avatarPreview);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      if (avatar) fd.append("avatar", avatar);
      fd.append("name", name);
      if (dob) fd.append("dob", dob);
      fd.append("country", country);
      fd.append("phone", phone);
      fd.append("street", street);
      fd.append("city", city);
      fd.append("state", stateVal);
      fd.append("postalCode", postalCode);

      await putForm("/profile", fd, token || undefined);
      await refreshUser();
      router.replace("/profile");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Profile</span>
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">Edit Profile</h1>
          <p className="text-slate-600">Update your information to keep your profile current</p>
        </div>

        {/* Form Card */}
        <div className="glass-effect rounded-2xl shadow-soft p-8 animate-slideUp">
          {error && (
            <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="text-center">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Profile Photo
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-purple-200 shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Camera className="text-white" size={40} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">Click the camera icon to change photo</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Street Address
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  City
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  State/Province
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="NY"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Postal Code
                </label>
                <input
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50"
                  value={postalCode}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
              <Link href="/profile">
                <AnimatedButton variant="outline" size="lg" icon={<X size={18} />}>
                  Cancel
                </AnimatedButton>
              </Link>
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                icon={<Save size={18} />}
              >
                Save Changes
              </AnimatedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
