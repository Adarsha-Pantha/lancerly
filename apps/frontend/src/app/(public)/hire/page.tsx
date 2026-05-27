"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Briefcase, Search, Loader2, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserProfilePanel } from "@/components/profile/UserProfilePanel";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const VIOLET       = "#6B4EFF";
const VIOLET_LIGHT = "#f0ecff";

function toPublicUrl(p?: string | null) {
  if (!p) return null;
  return /^https?:\/\//i.test(p) ? p : `${API}${p}`;
}

type Freelancer = {
  id: string;
  profile: {
    name: string | null;
    headline: string | null;
    avatarUrl: string | null;
    skills: string[];
    hourlyRate: number | null;
    rating: number | null;
    reviewCount: number | null;
    availability: boolean | null;
    country: string | null;
  } | null;
  completedJobs: number;
  rating: number;
  reviewCount: number;
};

const POPULAR_SKILLS = ["React", "UI/UX Design", "Node.js", "Python", "Figma", "WordPress"];

export default function HirePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [profilePanelUserId, setProfilePanelUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadFreelancers(q?: string, skill?: string) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (skill) params.set("skill", skill);
      const res = await fetch(`${API}/profile/freelancers?${params.toString()}`);
      const data = await res.json();
      setFreelancers(Array.isArray(data) ? data : []);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFreelancers();
  }, []);

  function handleSearch(q: string) {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadFreelancers(q, activeSkill || undefined), 400);
  }

  function handleSkill(skill: string) {
    const next = activeSkill === skill ? null : skill;
    setActiveSkill(next);
    loadFreelancers(search || undefined, next || undefined);
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ══ HERO ══ */}
      <section
        className="py-16 px-6 lg:px-10 text-center"
        style={{ background: "linear-gradient(135deg, #f5f0ff 0%, #fff 100%)" }}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4 text-slate-900">
            Hire <span style={{ color: VIOLET }}>Top Freelancers</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
            Browse verified professionals available for your next project.
          </p>

          {/* Search bar */}
          <div className="flex max-w-xl mx-auto bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-purple-300 transition-colors">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or skill…"
                className="w-full pl-10 pr-4 py-4 text-slate-800 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              type="button"
              className="px-6 py-4 text-white text-sm font-semibold shrink-0"
              style={{ backgroundColor: VIOLET }}
              onClick={() => loadFreelancers(search, activeSkill || undefined)}
            >
              Search
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══ SKILL PILLS ══ */}
      <section className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSkill(activeSkill || "")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeSkill ? "text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
              style={!activeSkill ? { backgroundColor: VIOLET } : {}}
            >
              All Skills
            </button>
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkill(skill)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSkill === skill ? "text-white" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
                style={activeSkill === skill ? { backgroundColor: VIOLET } : {}}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GRID ══ */}
      <section className="py-10 px-4 lg:px-10">
        <div className="max-w-6xl mx-auto">

          {/* Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-400">
              {loading ? "Loading…" : (
                <>{freelancers.length > 0 ? <><span className="font-semibold text-slate-700">{freelancers.length}</span> freelancers found</> : "No freelancers found"}</>
              )}
            </p>
            {!token && (
              <Link href="/login" className="text-sm font-semibold hover:underline" style={{ color: VIOLET }}>
                Log in to hire →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin" size={28} style={{ color: VIOLET }} />
            </div>
          ) : freelancers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={26} className="text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">No freelancers found</h3>
              <p className="text-slate-400 text-sm">Try a different search term or skill filter.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freelancers.map((f, i) => {
                const name = f.profile?.name || "Freelancer";
                const avatar = toPublicUrl(f.profile?.avatarUrl) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                const skills = Array.isArray(f.profile?.skills) ? f.profile!.skills : [];
                const rating = f.rating > 0 ? f.rating : null;

                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.15) }}
                  >
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 h-full flex flex-col hover:border-purple-200 hover:shadow-lg transition-all duration-200">

                      {/* Avatar + rating */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <img
                            src={avatar}
                            alt={name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow"
                          />
                          {f.profile?.availability && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                          )}
                        </div>
                        {rating !== null && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
                            <Star size={11} className="text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-700">{rating.toFixed(1)}</span>
                            {f.reviewCount > 0 && (
                              <span className="text-[10px] text-amber-500">({f.reviewCount})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="text-base font-bold text-slate-900 mb-0.5">{name}</h3>
                      {f.profile?.headline && (
                        <p className="text-sm text-slate-400 mb-1 line-clamp-1">{f.profile.headline}</p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 mb-3">
                        {f.completedJobs > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={11} className="text-emerald-500" />
                            {f.completedJobs} completed
                          </span>
                        )}
                        {f.profile?.country && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {f.profile.country}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {skills.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-0.5 text-xs font-medium rounded-full border"
                              style={{ background: VIOLET_LIGHT, color: VIOLET, borderColor: "#ddd6ff" }}
                            >
                              {s}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-400">
                              +{skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rate + CTA */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          {f.profile?.hourlyRate ? (
                            <>
                              <span className="text-lg font-black text-slate-900">${f.profile.hourlyRate}</span>
                              <span className="text-xs text-slate-400 ml-1">/hr</span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">Rate TBD</span>
                          )}
                        </div>
                        <button
                          onClick={() => setProfilePanelUserId(f.id)}
                          className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                          style={{ backgroundColor: VIOLET }}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden p-10 lg:p-14 text-center"
            style={{ background: `linear-gradient(135deg, ${VIOLET} 0%, #9b7bf7 100%)` }}
          >
            <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-white" />
            <h2 className="relative text-3xl font-black text-white mb-3">Ready to post a project?</h2>
            <p className="relative text-white/70 text-base mb-8 max-w-md mx-auto">
              Get proposals from top talent within hours.
            </p>
            <div className="relative flex justify-center gap-4 flex-wrap">
              {token ? (
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-white font-bold text-sm transition-all hover:opacity-90"
                  style={{ color: VIOLET }}
                >
                  <Briefcase size={15} /> Post a Project
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center h-12 px-8 rounded-xl bg-white font-bold text-sm"
                    style={{ color: VIOLET }}
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center h-12 px-8 rounded-xl border-2 border-white/30 font-bold text-sm text-white hover:bg-white/10 transition-all"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Panel */}
      {profilePanelUserId && (
        <UserProfilePanel
          userId={profilePanelUserId}
          onClose={() => setProfilePanelUserId(null)}
        />
      )}
    </div>
  );
}
