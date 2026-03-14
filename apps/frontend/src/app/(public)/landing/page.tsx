"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Zap,
  Trophy,
  Search,
  MessageSquare,
  CreditCard,
} from "lucide-react";

const categories = [
  { name: "Design & Creative",     icon: "🎨", count: "12k+ Freelancers" },
  { name: "Development & IT",      icon: "💻", count: "18k+ Freelancers" },
  { name: "AI & Data Science",     icon: "🤖", count: "8k+ Freelancers"  },
  { name: "Writing & Translation", icon: "✍️", count: "15k+ Freelancers" },
  { name: "Marketing & Sales",     icon: "📈", count: "10k+ Freelancers" },
  { name: "Business & Finance",    icon: "💼", count: "7k+ Freelancers"  },
];

const howItWorks = [
  {
    step: "01",
    icon: Search,
    title: "Find Expert Talent",
    desc: "Browse our curated marketplace of top-tier professionals or post a job to receive personalized proposals.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Collaborate Easily",
    desc: "Use our advanced workspace to communicate, share files, and track project milestones in real-time.",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Secure Payments",
    desc: "Pay safely with our escrow system. Funds are released only when you're 100% satisfied with the work.",
  },
];

const trustStats = [
  { value: "50M+",  label: "Project Value"     },
  { value: "200k+", label: "Verified Talents"  },
  { value: "99.9%", label: "Satisfaction Rate" },
  { value: "24/7",  label: "Expert Support"    },
];

// Brand colour token — used in inline style only where Tailwind can't
// handle an arbitrary hex at runtime (boxShadow, background blobs, etc.)
const VIOLET        = "#4f3fe0";
const VIOLET_LIGHT  = "#eeecfc";   // ~5% tint for badges / hover
const VIOLET_MID    = "#7b6ee8";   // softer accent

export default function LandingPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && token) router.replace("/home");
  }, [loading, token, router]);

  if (loading || token) return null;

  return (
    <div ref={containerRef} className="bg-white text-gray-900 overflow-x-hidden selection:bg-violet-200">

      {/* Ticker keyframe */}
      <style>{`
        @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        .ticker-track { animation: ticker 26s linear infinite; display:flex; gap:56px; white-space:nowrap; will-change:transform; }
      `}</style>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-20 overflow-hidden">

        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.14]"
          style={{ background: VIOLET }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.08]"
          style={{ background: VIOLET }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left copy ── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 border"
                style={{ background: VIOLET_LIGHT, color: VIOLET, borderColor: "#c9c3f5" }}
              >
                <Zap size={12} />
                Next-Gen Freelancing Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.65 }}
                className="text-5xl lg:text-[4.5rem] font-black leading-[1.06] tracking-tight mb-6"
              >
                Hiring elite talent
                <br />
                <span style={{ color: VIOLET }}>reimagined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.55 }}
                className="text-lg text-gray-500 leading-relaxed mb-10 max-w-[480px]"
              >
                Lancerly connects ambitious businesses with the world's top 3% of
                freelance talent through a premium, AI-powered workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: VIOLET, boxShadow: `0 10px 32px -4px ${VIOLET}55` }}
                >
                  Hire Top Talent <ArrowRight size={16} />
                </Link>
                <Link
                  href="/projects/browse"
                  className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-semibold text-base border-2 border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                >
                  Find Work
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.56 }}
                className="mt-12 flex items-center gap-5"
              >
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full border-[3px] border-white overflow-hidden shadow -ml-2 first:ml-0"
                    >
                      <img
                        src={`https://i.pravatar.cc/150?u=${i}`}
                        alt="user"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Trusted by 10k+ companies
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ── Right visual ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.75 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-[2.5rem] overflow-hidden border-[10px] border-white shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80"
                  alt="Premium Workspace"
                  width={800}
                  height={1000}
                  className="w-full h-auto block"
                />
              </div>

              {/* Float: Escrow */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-8 bg-white border border-gray-100 rounded-2xl p-5 w-60 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: VIOLET_LIGHT, color: VIOLET }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment Protection</p>
                    <p className="text-sm font-bold text-gray-800">Escrow Verified</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-full rounded-full" style={{ background: VIOLET }} />
                </div>
              </motion.div>

              {/* Float: Bids */}
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 -left-10 bg-white border border-gray-100 rounded-2xl p-4 w-56 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 border-white overflow-hidden -ml-2 first:ml-0"
                      >
                        <img
                          src={`https://i.pravatar.cc/100?u=${i + 10}`}
                          alt="talent"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">3 Active Bids</p>
                    <p className="text-xs text-gray-400">Premium Proposals</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════ TICKER ═══════════════════════ */}
      <div
        className="overflow-hidden py-3.5 border-y border-violet-100"
        style={{ background: VIOLET_LIGHT }}
      >
        <div className="ticker-track">
          {[...Array(2)].flatMap((_, idx) =>
            ["🎨 Design", "💻 Development", "🤖 AI & Data", "✍️ Writing", "📈 Marketing", "💼 Finance", "🌍 Remote-First", "⚡ Fast Delivery"].map(
              (label) => (
                <span key={label + idx} className="text-sm font-medium" style={{ color: VIOLET }}>
                  {label}
                </span>
              )
            )
          )}
        </div>
      </div>

      {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-16">
            <div>
              <span
                className="inline-flex items-center text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5 border"
                style={{ color: VIOLET, background: VIOLET_LIGHT, borderColor: "#c9c3f5" }}
              >
                Explore
              </span>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Browse elite talent <br />
                <span style={{ color: VIOLET }}>by category.</span>
              </h2>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed lg:text-right text-base">
              Access a global network of highly-skilled professionals across every major industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group cursor-pointer bg-white border-2 border-gray-100 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c9c3f5";
                  e.currentTarget.style.boxShadow = `0 20px 48px -8px ${VIOLET}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold mb-1.5 text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{cat.count}</p>
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: VIOLET }}
                >
                  Explore Talent{" "}
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="py-28 mx-4 lg:mx-8 rounded-[2.5rem] relative overflow-hidden bg-[#0c0b18]">

        {/* Glow blob */}
        <div
          className="pointer-events-none absolute top-[-80px] left-[40%] w-[480px] h-[480px] rounded-full blur-[130px] opacity-25"
          style={{ background: VIOLET }}
        />

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Steps */}
            <div>
              <span
                className="inline-flex items-center text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8 border"
                style={{ color: VIOLET_MID, background: `${VIOLET}22`, borderColor: `${VIOLET}44` }}
              >
                How it works
              </span>

              <h2 className="text-4xl lg:text-5xl font-black leading-tight text-white mb-14">
                The most reliable way <br />
                <span style={{ color: VIOLET_MID }}>to get work done.</span>
              </h2>

              <div className="space-y-12">
                {howItWorks.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.18 }}
                    className="flex gap-7 fle"
                  >
                    <div
                      className="text-5xl font-black leading-none shrink-0 w-12 text-right tabular-nums"
                      style={{ color: `${VIOLET}55` }}
                    >
                      {item.step}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed text-[0.95rem]">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Collaboration"
                  width={800}
                  height={600}
                  className="w-full h-auto block"
                />
              </div>
              <div
                className="absolute -bottom-5 -right-5 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: VIOLET,
                  boxShadow: `0 0 0 10px ${VIOLET}33`,
                }}
              >
                <Trophy size={28} className="text-white" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="h-px bg-gray-100 mb-20" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {trustStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-5xl lg:text-6xl font-black tracking-tighter mb-2"
                  style={{ color: VIOLET }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-semibold tracking-widest uppercase text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="h-px bg-gray-100 mt-20" />
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="pb-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden p-12 lg:p-20"
            style={{ background: VIOLET }}
          >
            {/* Inner glow right */}
            <div className="pointer-events-none absolute top-0 right-0 w-[460px] h-[460px] rounded-full blur-[100px] opacity-20 bg-white" />
            {/* Inner shadow left */}
            <div className="pointer-events-none absolute bottom-0 left-0 w-[280px] h-[280px] rounded-full blur-[80px] opacity-10 bg-black" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
                  Scale your business with <br />
                  <span className="text-white/60">the world's best talent.</span>
                </h2>
                <p className="text-white/60 text-lg max-w-lg leading-relaxed">
                  Join 10,000+ companies who trust Lancerly to build
                  high-performing remote teams.
                </p>
              </div>

              <div className="flex flex-col gap-4 shrink-0 min-w-[220px]">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl bg-white font-bold text-base transition-all hover:-translate-y-0.5 hover:bg-white/90"
                  style={{ color: VIOLET }}
                >
                  Get Started Now <ArrowRight size={16} />
                </Link>
                <Link
                  href="/projects/browse"
                  className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-bold text-base border-2 border-white/25 text-white hover:bg-white/10 transition-all"
                >
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}