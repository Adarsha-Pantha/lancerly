"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, putForm } from "@/lib/api";
import { toPublicUrl } from "@/lib/url";
import { Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

  // Prefill from backend
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="mx-auto max-w-3xl bg-white rounded-xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-indigo-600 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Profile
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="text-gray-400 m-3" size={28} />
                )}
              </div>
              <input type="file" accept="image/*" onChange={onFileChange} />
            </div>
          </div>

          {/* Fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Street
            </label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={postalCode}
                onChange={(e) => setPostal(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/profile"
              className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-white font-semibold hover:bg-indigo-700"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
