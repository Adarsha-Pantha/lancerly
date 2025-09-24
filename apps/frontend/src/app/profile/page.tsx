"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { needsCompletion } from "@/lib/auth";
import { toPublicUrl } from "@/lib/url";
import {
  MapPin,
  Phone,
  Calendar,
  UserCircle2,
  Home,
  Building2,
  Hash,
  ShieldCheck,
  Sparkles,
  Pencil,
} from "lucide-react";

type Field = string | null | undefined;

function clsx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function firstInitial(name?: string | null, fallback: string = "U") {
  if (!name) return fallback;
  return name.trim().slice(0, 1).toUpperCase();
}

function calcCompletion(
  name?: Field,
  country?: Field,
  phone?: Field,
  street?: Field,
  city?: Field,
  state?: Field,
  postal?: Field
) {
  const req = [name, country, phone, street, city, state, postal];
  const filled = req.filter((v) => !!v && String(v).trim().length > 0).length;
  return Math.round((filled / req.length) * 100);
}

function CompletionRing({
  size = 132,
  stroke = 8,
  value = 0,
}: {
  size?: number;
  stroke?: number;
  value?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(99,102,241,0.15)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#grad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        fill="none"
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } finally {
        setHydrated(true);
      }
    })();
  }, [refreshUser]);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated) return;
    if (token && needsCompletion(user)) {
      router.replace("/profile/setup");
    }
  }, [hydrated, token, user, router]);

  const completion = useMemo(
    () =>
      calcCompletion(
        user?.name,
        user?.country,
        user?.phone,
        user?.street,
        user?.city,
        user?.state,
        user?.postalCode
      ),
    [user]
  );

  if (!token) return null;
  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-pulse text-slate-500">Loading profile…</div>
      </div>
    );
  }

  const avatarUrl = toPublicUrl(user?.avatarUrl);
  const name = user?.name || "";
  const role = user?.role || "FREELANCER";

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_120%_at_50%_-20%,#c7d2fe_0%,transparent_60%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      {/* HERO */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <div className="relative mx-auto -mb-12 flex max-w-6xl justify-center px-6">
          <div className="relative mt-24">
            <div className="relative h-32 w-32">
              <CompletionRing value={completion} />
              <div
                className={clsx(
                  "absolute inset-0 rounded-full overflow-hidden border-4 bg-white",
                  avatarUrl ? "border-white" : "border-indigo-200"
                )}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-content-center bg-indigo-50 text-4xl font-bold text-indigo-700">
                    {firstInitial(name)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-md">
                {completion === 100 ? "Profile complete" : `${completion}% complete`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow backdrop-blur">
            <ShieldCheck size={14} className="text-emerald-600" />
            {role === "CLIENT" ? "Client" : role === "ADMIN" ? "Admin" : "Freelancer"}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {name || "Your Name"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Welcome to your public profile. Keep it sharp—clients love polished profiles!
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profile/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-slate-50"
            >
              <Sparkles size={16} />
              Boost Visibility
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Location"
            icon={<MapPin className="text-indigo-600" size={18} />}
            value={
              user?.city || user?.country
                ? `${user?.city ?? "—"}, ${user?.country ?? "—"}`
                : "—"
            }
          />
          <InfoCard
            title="Phone"
            icon={<Phone className="text-indigo-600" size={18} />}
            value={user?.phone || "—"}
          />
          <InfoCard
            title="Date of birth"
            icon={<Calendar className="text-indigo-600" size={18} />}
            value={user?.dob ? new Date(user.dob).toLocaleDateString() : "—"}
          />
          <InfoCard
            title="Street"
            icon={<Home className="text-indigo-600" size={18} />}
            value={user?.street || "—"}
          />
          <InfoCard
            title="State/Province"
            icon={<Building2 className="text-indigo-600" size={18} />}
            value={user?.state || "—"}
          />
          <InfoCard
            title="Postal Code"
            icon={<Hash className="text-indigo-600" size={18} />}
            value={user?.postalCode || "—"}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-indigo-100/70 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-2 text-slate-800">
            <UserCircle2 size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              About
            </h2>
          </div>
          <p className="text-slate-700">
            Add a short bio and specialties to stand out. Share achievements, tools you
            use, and what clients can expect from collaborating with you.
          </p>
          <Link
            href="/profile/setup"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
          >
            <Pencil size={16} />
            Add bio & skills
          </Link>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
      </div>
      <div className="text-lg font-medium text-slate-900">{value}</div>
    </div>
  );
}
