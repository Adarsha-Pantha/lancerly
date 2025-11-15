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

function firstInitial(name?: string | null, fallback: string = "U") {
  if (!name) return fallback;
  return name.trim().slice(0, 1).toUpperCase();
}

function calcCompletion(...fields: Field[]) {
  const filled = fields.filter((v) => !!v && String(v).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
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
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="animate-pulse text-gray-800 text-lg font-semibold">
          Loading profile…
        </div>
      </div>
    );
  }

  const avatarUrl = user?.avatarUrl ? toPublicUrl(user.avatarUrl) : "";
  const name = user?.name || "";
  const role = user?.role || "FREELANCER";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HERO */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700" />
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-100 to-transparent" />
        </div>

        {/* Avatar */}
        <div className="relative mx-auto -mb-12 flex max-w-6xl justify-center px-6">
          <div className="relative mt-24">
            <div className="relative h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-content-center bg-indigo-200 text-4xl font-bold text-white">
                  {firstInitial(name)}
                </div>
              )}
            </div>
            {/* Completion chip */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
              {completion === 100
                ? "Profile complete"
                : `${completion}% complete`}
            </div>
          </div>
        </div>
      </div>

      {/* NAME + ACTIONS */}
      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-800 shadow">
            <ShieldCheck size={14} className="text-green-600" />
            {role === "CLIENT"
              ? "Client"
              : role === "ADMIN"
              ? "Admin"
              : "Freelancer"}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
            {name || "Your Name"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-700">
            Welcome to your profile. Keep it updated for better visibility.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
            <button
              onClick={() =>
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 shadow hover:bg-gray-100"
            >
              <Sparkles size={16} />
              Boost Visibility
            </button>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <InfoCard title="Location" value={`${user?.city || "—"}, ${user?.country || "—"}`} />
          <InfoCard title="Phone" value={user?.phone || "—"} />
          <InfoCard title="Date of birth" value={user?.dob ? new Date(user.dob).toLocaleDateString() : "—"} />
          <InfoCard title="Street" value={user?.street || "—"} />
          <InfoCard title="State/Province" value={user?.state || "—"} />
          <InfoCard title="Postal Code" value={user?.postalCode || "—"} />
        </div>

        {/* ABOUT */}
        <div className="mt-10 rounded-xl border bg-white p-6 shadow">
          <div className="mb-3 flex items-center gap-2">
            <UserCircle2 size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              About
            </h2>
          </div>
          <p className="text-gray-800">
            Add a short bio and your specialties. This helps clients know you
            better and builds trust.
          </p>
          <Link
            href="/profile/edit"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            <Pencil size={16} />
            Add Bio & Skills
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
        {title}
      </h3>
      <div className="text-lg font-medium text-gray-900">{value}</div>
    </div>
  );
}
