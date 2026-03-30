"use client";

import { motion } from "framer-motion";
import { Star, ArrowLeft, Briefcase, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const freelancers = [
  {
    name: "Aarav Sharma",
    title: "Full Stack Developer",
    rating: 4.9,
    skills: ["React", "Node.js", "MongoDB"],
    hourlyRate: "$45-65",
    completedJobs: 127,
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Sophia Patel",
    title: "Graphic Designer",
    rating: 4.8,
    skills: ["Photoshop", "Illustrator", "Branding"],
    hourlyRate: "$35-50",
    completedJobs: 89,
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Liam Wilson",
    title: "Data Scientist",
    rating: 5.0,
    skills: ["Python", "TensorFlow", "SQL"],
    hourlyRate: "$60-80",
    completedJobs: 156,
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Emma Chen",
    title: "Mobile App Developer",
    rating: 4.9,
    skills: ["React Native", "Flutter", "iOS"],
    hourlyRate: "$50-70",
    completedJobs: 94,
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "Marcus Johnson",
    title: "Content Writer",
    rating: 4.7,
    skills: ["SEO", "Technical Writing", "Blog"],
    hourlyRate: "$25-40",
    completedJobs: 213,
    avatar: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Isabella Martinez",
    title: "UI/UX Designer",
    rating: 4.8,
    skills: ["Figma", "Adobe XD", "Prototyping"],
    hourlyRate: "$40-55",
    completedJobs: 76,
    avatar: "https://i.pravatar.cc/150?img=47",
  },
];

const VIOLET       = "#4f3fe0";
const VIOLET_LIGHT = "#eeecfc";

// Inline SVG illustration — abstract "team / search" motif
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      {/* Background card */}
      <rect x="40" y="60" width="400" height="300" rx="32" fill="#eeecfc" />

      {/* Top-right accent circle */}
      <circle cx="400" cy="90" r="48" fill="#4f3fe0" opacity="0.12" />
      <circle cx="400" cy="90" r="28" fill="#4f3fe0" opacity="0.18" />

      {/* Central search circle */}
      <circle cx="240" cy="190" r="88" fill="white" />
      <circle cx="240" cy="190" r="88" stroke="#4f3fe0" strokeWidth="3" strokeDasharray="6 4" opacity="0.25" />

      {/* Magnifier */}
      <circle cx="232" cy="182" r="36" stroke="#4f3fe0" strokeWidth="5" fill="white" />
      <line x1="258" y1="208" x2="280" y2="230" stroke="#4f3fe0" strokeWidth="5" strokeLinecap="round" />
      {/* Magnifier inner sparkle */}
      <circle cx="225" cy="175" r="8" fill="#eeecfc" />
      <circle cx="240" cy="168" r="4" fill="#c9c3f5" />

      {/* Avatar bubbles floating around */}
      {/* Top-left avatar */}
      <circle cx="108" cy="148" r="30" fill="white" stroke="#e5e0fa" strokeWidth="2" />
      <circle cx="108" cy="143" r="12" fill="#c9c3f5" />
      <ellipse cx="108" cy="163" rx="16" ry="10" fill="#c9c3f5" />
      {/* Rating star badge on it */}
      <rect x="120" y="130" width="28" height="16" rx="8" fill="#fef3c7" />
      <text x="126" y="142" fontSize="10" fill="#d97706" fontWeight="bold">4.9</text>

      {/* Bottom-left avatar */}
      <circle cx="90" cy="268" r="26" fill="white" stroke="#e5e0fa" strokeWidth="2" />
      <circle cx="90" cy="263" r="10" fill="#a5b4fc" />
      <ellipse cx="90" cy="281" rx="13" ry="8" fill="#a5b4fc" />

      {/* Top-right avatar */}
      <circle cx="372" cy="142" r="30" fill="white" stroke="#e5e0fa" strokeWidth="2" />
      <circle cx="372" cy="137" r="12" fill="#6ee7b7" />
      <ellipse cx="372" cy="157" rx="16" ry="10" fill="#6ee7b7" />
      <rect x="344" y="124" width="28" height="16" rx="8" fill="#fef3c7" />
      <text x="350" y="136" fontSize="10" fill="#d97706" fontWeight="bold">5.0</text>

      {/* Bottom-right avatar */}
      <circle cx="382" cy="262" r="26" fill="white" stroke="#e5e0fa" strokeWidth="2" />
      <circle cx="382" cy="257" r="10" fill="#fca5a5" />
      <ellipse cx="382" cy="275" rx="13" ry="8" fill="#fca5a5" />

      {/* Connector dots/lines */}
      <line x1="136" y1="155" x2="198" y2="178" stroke="#c9c3f5" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="344" y1="158" x2="282" y2="178" stroke="#c9c3f5" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="110" y1="252" x2="176" y2="220" stroke="#c9c3f5" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="360" y1="252" x2="298" y2="220" stroke="#c9c3f5" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Bottom label bar */}
      <rect x="140" y="308" width="200" height="36" rx="18" fill="white" />
      <circle cx="165" cy="326" r="10" fill="#4f3fe0" opacity="0.15" />
      <circle cx="165" cy="326" r="5" fill="#4f3fe0" />
      <rect x="182" y="319" width="80" height="8" rx="4" fill="#e5e7eb" />
      <rect x="182" y="330" width="52" height="6" rx="3" fill="#ede9fb" />
      <rect x="298" y="320" width="28" height="12" rx="6" fill="#4f3fe0" opacity="0.12" />
      <text x="302" y="330" fontSize="9" fill="#4f3fe0" fontWeight="bold">✓ OK</text>

      {/* Bottom-left blob */}
      <circle cx="60" cy="340" r="36" fill="#4f3fe0" opacity="0.07" />

      {/* Top-right small dots pattern */}
      {[0,1,2,3].map(col =>
        [0,1,2].map(row => (
          <circle key={`${col}-${row}`} cx={415 + col * 12} cy={68 + row * 12} r="2" fill="#4f3fe0" opacity="0.18" />
        ))
      )}
    </svg>
  );
}

export default function HirePage() {
  const { token } = useAuth();
  const router = useRouter();

  const handleHire = (name: string) => {
    if (!token) {
      router.push(`/login?redirect=/hire`);
    } else {
      alert(`You hired ${name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative pt-16 pb-10 px-6 lg:px-10 overflow-hidden">

        {/* Blobs */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[150px] opacity-[0.10]"
          style={{ background: VIOLET }}
        />
        <div
          className="pointer-events-none absolute top-0 right-0 w-[340px] h-[340px] rounded-full blur-[110px] opacity-[0.07]"
          style={{ background: VIOLET }}
        />

        <div className="max-w-7xl mx-auto">

          {/* Back link */}
          {/* <Link
            href="/landing"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors mb-12 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link> */}

          {/* Two-column hero */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 border"
                style={{ background: VIOLET_LIGHT, color: VIOLET, borderColor: "#c9c3f5" }}
              >
                <Briefcase size={11} />
                Verified Professionals
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-5xl lg:text-[3.75rem] font-black leading-[1.06] tracking-tight mb-5 text-gray-900"
              >
                Hire{" "}
                <span style={{ color: VIOLET }}>Top Talent</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.55 }}
                className="text-lg text-gray-500 leading-relaxed max-w-lg mb-10"
              >
                Find verified professionals trusted by hundreds of companies.
                Browse our curated selection of expert freelancers.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="flex flex-wrap gap-8"
              >
                {[["200k+", "Verified Talents"], ["99.9%", "Satisfaction"], ["24/7", "Support"]].map(([val, lbl]) => (
                  <div key={lbl} className="flex items-baseline gap-2">
                    <span className="text-2xl font-black" style={{ color: VIOLET }}>{val}</span>
                    <span className="text-sm text-gray-400 font-medium">{lbl}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — vector illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="w-full max-w-[460px]">
                <HeroIllustration />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════ SEARCH BAR ═══════════════════════ */}
      <section className="px-6 lg:px-10 pb-14">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 items-stretch"
          >
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by skill, role, or name…"
                className="w-full h-14 pl-12 pr-5 rounded-2xl border-2 border-gray-100 bg-white text-gray-800 text-sm font-medium placeholder-gray-400 outline-none transition-all focus:border-[#c9c3f5]"
                style={{ "--tw-ring-color": VIOLET } as React.CSSProperties}
                onFocus={e => (e.currentTarget.style.borderColor = "#c9c3f5")}
                onBlur={e  => (e.currentTarget.style.borderColor = "")}
              />
            </div>

            {/* Category select */}
            <select
              className="h-14 px-5 rounded-2xl border-2 border-gray-100 bg-white text-gray-600 text-sm font-medium outline-none appearance-none cursor-pointer transition-all min-w-[172px]"
              onFocus={e => (e.currentTarget.style.borderColor = "#c9c3f5")}
              onBlur={e  => (e.currentTarget.style.borderColor = "")}
            >
              <option value="">All Categories</option>
              <option>Design & Creative</option>
              <option>Development & IT</option>
              <option>AI & Data Science</option>
              <option>Writing & Translation</option>
              <option>Marketing & Sales</option>
              <option>Business & Finance</option>
            </select>

            {/* Filter button */}
            <button
              className="h-14 px-5 rounded-2xl border-2 border-gray-100 bg-white text-gray-500 text-sm font-medium flex items-center gap-2 hover:border-gray-300 transition-all"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            {/* Search CTA */}
            <button
              className="h-14 px-8 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              style={{ background: VIOLET, boxShadow: `0 8px 24px -4px ${VIOLET}55` }}
            >
              Search
            </button>
          </motion.div>

          {/* Quick filter pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.58 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {["React Developer", "UI Designer", "Data Scientist", "Content Writer", "Mobile Dev", "SEO Expert"].map(tag => (
              <button
                key={tag}
                className="text-xs font-medium px-4 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-[#c9c3f5] hover:text-[#4f3fe0] transition-all"
                style={{"--hover-color": VIOLET} as React.CSSProperties}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-6 lg:mx-10" />

      {/* ═══════════════════════ GRID ═══════════════════════ */}
      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-gray-400 font-medium">
              Showing <span className="text-gray-800 font-semibold">{freelancers.length}</span> professionals
            </p>
            <select className="text-sm text-gray-500 border border-gray-200 rounded-xl px-4 py-2 outline-none bg-white">
              <option>Sort: Top Rated</option>
              <option>Sort: Highest Rate</option>
              <option>Sort: Most Jobs</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group"
              >
                <div
                  className="bg-white border-2 border-gray-100 rounded-3xl p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1.5 cursor-default"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c9c3f5";
                    e.currentTarget.style.boxShadow = `0 20px 48px -8px ${VIOLET}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  {/* Avatar row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="relative">
                      <img
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Online dot */}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-amber-700">{freelancer.rating}</span>
                    </div>
                  </div>

                  {/* Name & title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{freelancer.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">{freelancer.title}</p>

                  {/* Jobs done */}
                  <p className="text-xs text-gray-400 mb-5">
                    <span className="font-semibold text-gray-600">{freelancer.completedJobs}</span> jobs completed
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-3 py-1 rounded-full border"
                        style={{ background: VIOLET_LIGHT, color: VIOLET, borderColor: "#c9c3f5" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Rate + CTA */}
                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xl font-black text-gray-900">{freelancer.hourlyRate}</span>
                      <span className="text-xs text-gray-400 ml-1">/hr</span>
                    </div>
                    <button
                      className="inline-flex items-center gap-1.5 h-10 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                      style={{ background: VIOLET, boxShadow: `0 6px 20px -4px ${VIOLET}55` }}
                      onClick={() => handleHire(freelancer.name)}
                    >
                      {token ? "Hire Now" : "Login to Hire"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden p-12 lg:p-20"
            style={{ background: VIOLET }}
          >
            <div className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 bg-white" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-[260px] h-[260px] rounded-full blur-[80px] opacity-10 bg-black" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                  Ready to Hire?
                </h2>
                <p className="text-white/60 text-lg max-w-md leading-relaxed">
                  Post your project and get proposals from top talent within hours.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-14 px-10 rounded-xl bg-white font-bold text-base transition-all hover:-translate-y-0.5 hover:bg-white/90"
                  style={{ color: VIOLET }}
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center justify-center h-14 px-10 rounded-xl font-bold text-base border-2 border-white/25 text-white hover:bg-white/10 transition-all"
                >
                  Post a Project
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}