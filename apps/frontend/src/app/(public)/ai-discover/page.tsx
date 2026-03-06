"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, LineChart, ArrowLeft, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
const features = [
  {
    icon: Target,
    title: "Smart Matching",
    description: "AI analyzes your requirements to find the perfect talent match"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get matched with qualified freelancers in seconds, not days"
  },
  {
    icon: TrendingUp,
    title: "Continuous Learning",
    description: "Our AI improves with every interaction and successful match"
  }
];

export default function AiDiscoverPage() {
  const { token } = useAuth();
  const router = useRouter();

  const handleTry = () => {
    if (!token) {
      router.push("/login?redirect=/ai-discover");
    } else {
      alert("AI Matching activated!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-mint/5">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Link 
              href="/landing"
              className="inline-flex items-center gap-2 text-slate-blue hover:text-mint transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-mint/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-mint" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-blue mb-6"
            >
              AI-Powered Talent Discovery
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-blue/70 max-w-3xl mx-auto leading-relaxed"
            >
              Smart AI that connects freelancers and clients instantly. 
              Experience the future of hiring with intelligent matching algorithms.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Feature */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-mint/10 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-mint" />
            </div>
            <h2 className="text-3xl font-bold text-slate-blue mb-4">
              Discover the Future of Hiring
            </h2>
            <p className="text-slate-blue/70 mb-8 leading-relaxed max-w-2xl mx-auto">
              AI-powered algorithms analyze your profile, skills, and preferences
              to deliver the perfect matches in seconds. No more endless searching.
            </p>

            <Button
              size="lg"
              className="bg-mint hover:bg-mint/90 text-white px-8 py-3"
              onClick={handleTry}
            >
              {token ? "Start AI Matching" : "Login to Try"}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-blue mb-4">Why Choose AI Matching?</h2>
            <p className="text-xl text-slate-blue/70">Experience the difference intelligent technology makes</p>
          </motion.div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center text-mint mx-auto mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-blue mb-3">{feature.title}</h3>
                <p className="text-slate-blue/70 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "95%", label: "Match Accuracy" },
              { number: "10x", label: "Faster Hiring" },
              { number: "24/7", label: "AI Available" },
              { number: "1M+", label: "Successful Matches" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-mint mb-2">{stat.number}</div>
                <div className="text-slate-blue/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-mint to-mint/80 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Experience AI-Powered Hiring?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of freelancers and clients who are already using AI to find perfect matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-mint font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/projects/browse"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mint transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
