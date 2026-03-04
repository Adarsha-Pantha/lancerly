"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  FileSearch, 
  Handshake, 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Users, 
  Zap,
  Globe,
  Trophy,
  Search,
  MessageSquare,
  CreditCard
} from "lucide-react";

const categories = [
  { name: "Design & Creative", icon: "🎨", count: "12k+ Freelancers", color: "from-purple-500/10 to-pink-500/10" },
  { name: "Development & IT", icon: "💻", count: "18k+ Freelancers", color: "from-blue-500/10 to-cyan-500/10" },
  { name: "AI & Data Science", icon: "🤖", count: "8k+ Freelancers", color: "from-emerald-500/10 to-teal-500/10" },
  { name: "Writing & Translation", icon: "✍️", count: "15k+ Freelancers", color: "from-orange-500/10 to-yellow-500/10" },
  { name: "Marketing & Sales", icon: "📈", count: "10k+ Freelancers", color: "from-rose-500/10 to-red-500/10" },
  { name: "Business & Finance", icon: "💼", count: "7k+ Freelancers", color: "from-indigo-500/10 to-blue-500/10" },
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
  { value: "50M+", label: "Project Value" },
  { value: "200k+", label: "Verified Talents" },
  { value: "99.9%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Expert Support" },
];

export default function LandingPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!loading && token) {
      router.replace("/home");
    }
  }, [loading, token, router]);

  if (loading || token) {
    return null;
  }

  return (
    <div ref={containerRef} className="min-h-screen selection:bg-accent/30 selection:text-accent overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-premium border-accent/20 text-accent font-bold text-sm mb-8"
              >
                <Zap size={16} className="animate-pulse" />
                <span>Next-Gen Freelancing Platform</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-display mb-8"
              >
                Hiring elite talent <br />
                <span className="gradient-text-hero">reimagined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body-lg text-muted-foreground mb-12 max-w-xl"
              >
                Lancerly connects ambitious businesses with the world's top 3% of freelance talent through a premium, AI-powered workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <Button asChild className="btn-accent-premium h-16 px-10 text-lg">
                  <Link href="/register">Hire Top Talent</Link>
                </Button>
                <Button asChild variant="outline" className="glass-card-premium h-16 px-10 text-lg border-primary/10 hover:bg-white/50">
                  <Link href="/projects/browse">Find Work</Link>
                </Button>
              </motion.div>

              {/* Trust Micro-Interactions */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center gap-6"
              >
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-lg">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-sm font-bold text-primary">Trusted by 10k+ companies</p>
                </div>
              </motion.div>
            </div>

            {/* 3D-Inspired Visual Elements */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="relative rounded-[3rem] overflow-hidden shadow-3d border-[12px] border-white/50 backdrop-blur-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80"
                    alt="Premium Workspace"
                    width={800}
                    height={1000}
                    className="w-full h-auto"
                  />
                </div>

                {/* Floating Glass Cards */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 glass-card-premium p-6 w-64 animate-float"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Protection</p>
                      <p className="font-bold">Escrow Verified</p>
                    </div>
                  </div>
                  <div className="h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[100%] animate-pulse" />
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-10 -left-16 glass-card-premium p-6 w-72 animate-float-slow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="talent" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-sm">3 Active Bids</p>
                      <p className="text-xs text-muted-foreground">Premium Proposals</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorized Services Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-heading mb-6"
            >
              Browse elite talent by <span className="text-accent">category.</span>
            </motion.h2>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Access a global network of highly-skilled professionals across every major industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className={`p-8 rounded-[2.5rem] bg-white border border-border transition-all duration-500 hover:shadow-3d-hover hover:-translate-y-2 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-500 inline-block">{cat.icon}</div>
                    <h3 className="text-2xl font-black mb-2">{cat.name}</h3>
                    <p className="text-muted-foreground mb-6">{cat.count}</p>
                    <div className="flex items-center text-accent font-bold group-hover:gap-2 transition-all">
                      Explore Talent <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Premium Flow */}
      <section className="py-32 bg-primary text-white rounded-[4rem] mx-4 sm:mx-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-heading text-white mb-8">
                The most reliable way to <br />
                <span className="text-accent-light">get work done.</span>
              </h2>
              <div className="space-y-12">
                {howItWorks.map((item, i) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-8"
                  >
                    <div className="text-4xl font-black text-white/20 tracking-tighter">{item.step}</div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                      <p className="text-white/60 leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card-premium border-white/10 p-4">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Collaboration"
                  width={800}
                  height={600}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 glass-card-premium p-8 bg-accent animate-pulse-glow">
                <Trophy size={48} className="text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {trustStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-primary mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - High Impact */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-accent rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-blue-600 animate-gradient-shift" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                Scale your business with <br /> the world's best talent.
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Join 10,000+ companies who trust Lancerly to build high-performing remote teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild className="bg-white text-accent hover:bg-white/90 h-16 px-12 text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-105">
                  <Link href="/register">Get Started Now</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 h-16 px-12 text-lg font-bold rounded-2xl transition-all hover:scale-105">
                  <Link href="/projects/browse">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
