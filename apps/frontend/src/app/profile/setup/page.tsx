// apps/frontend/src/app/profile/setup/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, putForm } from "@/lib/api";
import { needsCompletion } from "@/lib/auth";
import { toPublicUrl } from "@/lib/url";
import {
  Camera,
  Calendar,
  User2,
  PhoneCall,
  MapPin,
  ArrowRight,
  Info,
  ShieldCheck,
} from "lucide-react";

const COUNTRIES = [
  "Nepal","India","Bangladesh","Pakistan","Sri Lanka","Bhutan","Maldives",
  "United States","United Kingdom","Canada","Australia","Germany","France","Japan",
];

export default function ProfileSetup() {
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

  // Prefill existing profile
  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        setLoading(true);
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
        setAvatarPreview(toPublicUrl(u?.avatarUrl));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Completion %
  const completion = useMemo(() => {
    const req = [name, country, phone, street, city, stateVal, postalCode];
    const filled = req.filter(v => v && v.trim().length > 0).length;
    return Math.round((filled / req.length) * 100);
  }, [name, country, phone, street, city, stateVal, postalCode]);

  const isValid = useMemo(
    () => name && country && phone && street && city && stateVal && postalCode,
    [name, country, phone, street, city, stateVal, postalCode]
  );

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
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

      await putForm("/profile", fd);

      const updated = await refreshUser();
      if (updated && !needsCompletion(updated)) {
        router.replace("/profile");
      } else {
        router.replace("/profile/setup");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function onSkip() {
    router.replace("/");
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_80%_at_50%_-10%,#c7d2fe_0%,transparent_60%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 blur-3xl [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]">
          <div className="mx-auto h-[220px] max-w-6xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-6 pt-10">
          <div className="rounded-xl bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 shadow backdrop-blur inline-flex items-center gap-1">
            <ShieldCheck size={14}/> Boost trust & visibility
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Complete your profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Add your basic details. A polished profile improves matching and client confidence.
          </p>
          <div className="mt-4 w-full max-w-sm">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Profile completion</span>
              <span className="font-semibold text-slate-900">{completion}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-12 lg:grid-cols-3">
        {/* left summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white/80 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white shadow-lg outline outline-2 outline-indigo-200">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-lg font-bold text-indigo-800">
                    {(name || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {name || "Your name"}
                </div>
                <div className="text-xs text-slate-500">
                  Visible to clients and collaborators
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><User2 size={16}/> {name || "—"}</li>
              <li className="flex items-center gap-2"><MapPin size={16}/> {country || "—"}</li>
              <li className="flex items-center gap-2"><PhoneCall size={16}/> {phone || "—"}</li>
              <li className="flex items-center gap-2"><Calendar size={16}/> {dob || "—"}</li>
            </ul>

            <div className="mt-6 rounded-lg bg-indigo-50 px-4 py-3 text-xs text-indigo-900">
              <p className="flex items-start gap-2">
                <Info size={16} className="mt-0.5" />
                Complete profiles are highlighted in search and appear more trustworthy.
              </p>
            </div>
          </div>
        </aside>

        {/* right form */}
        <section className="lg:col-span-2">
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-2xl border bg-white/90 p-6 shadow-xl"
          >
            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading…</div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* avatar uploader */}
                <div className="mb-8">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile photo</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50">
                      <Camera className="text-slate-500 transition group-hover:text-indigo-600" size={18}/>
                      <span className="font-medium">Upload photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onFileChange}/>
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => { setAvatar(null); setAvatarPreview(""); }}
                        className="rounded-xl border px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    )}
                    <span className="text-xs text-slate-400">JPG/PNG up to 5MB</span>
                  </div>
                </div>

                {/* form fields */}
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Date of birth</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-xl border px-3 py-2"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Phone (E.164) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Street address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border px-3 py-2"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">City *</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">State/Province *</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={stateVal}
                      onChange={(e) => setStateVal(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">ZIP/Postal *</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2"
                      value={postalCode}
                      onChange={(e) => setPostal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* actions */}
                <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onSkip}
                    className="rounded-xl border px-5 py-2 text-sm font-medium"
                  >
                    Skip now
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || saving}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                  >
                    {saving ? "Saving…" : <>Save & Continue <ArrowRight className="ml-1" size={16}/></>}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
