"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  Globe2,
  Star,
  Zap,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-purple-50 text-gray-800">
      {/* 🌟 Hero Section */}
      <section className="flex flex-col items-center text-center py-24 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold max-w-3xl leading-tight"
        >
          Hire <span className="text-yellow-300">Smart.</span> Work{" "}
          <span className="text-yellow-300">Faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-lg text-white/90 max-w-2xl"
        >
          Lancerly connects top freelancers and businesses using AI-powered
          matching. Build teams that deliver excellence — globally.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button asChild className="px-6 py-3 text-lg bg-yellow-400 text-black hover:bg-yellow-300">
            <Link href="/register">Join as Freelancer</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-6 py-3 text-lg border-white text-white hover:bg-white/10"
          >
            <Link href="/register">Hire Talent</Link>
          </Button>
        </motion.div>
      </section>

      {/* 🏆 Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 text-center gap-8">
          {[
            { value: "10K+", label: "Freelancers Worldwide" },
            { value: "500+", label: "Companies Trust Us" },
            { value: "98%", label: "Client Satisfaction" },
          ].map((item) => (
            <div key={item.label}>
              <h3 className="text-4xl font-extrabold text-indigo-600">
                {item.value}
              </h3>
              <p className="text-gray-600 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 💼 Categories */}
      <section className="py-20 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Explore Popular Categories
          </h2>
          <p className="text-gray-600 mb-10">
            Find professionals across the most in-demand fields.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[
              { icon: <Globe2 />, name: "Web Development" },
              { icon: <Sparkles />, name: "Graphic Design" },
              { icon: <MessageCircle />, name: "Content Writing" },
              { icon: <Zap />, name: "Digital Marketing" },
              { icon: <Briefcase />, name: "Data Science" },
              { icon: <Users />, name: "Virtual Assistance" },
              { icon: <ShieldCheck />, name: "Cybersecurity" },
              { icon: <Star />, name: "UI/UX Design" },
            ].map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-white shadow hover:shadow-xl border border-indigo-100 flex flex-col items-center justify-center transition"
              >
                <div className="text-indigo-600 mb-3">{cat.icon}</div>
                <p className="font-medium text-gray-800">{cat.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚙️ How It Works */}
      <section className="py-24 bg-white border-t border-indigo-100">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Post a Project",
                desc: "Describe your needs and set your budget — it takes just a few minutes.",
              },
              {
                step: "02",
                title: "Get AI-Matched",
                desc: "Our algorithm connects you with the most relevant freelancers instantly.",
              },
              {
                step: "03",
                title: "Collaborate Securely",
                desc: "Chat, share files, and pay securely when the job is done.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-8 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition"
              >
                <h3 className="text-indigo-600 text-2xl font-bold mb-3">
                  {item.step}
                </h3>
                <h4 className="text-xl font-semibold mb-2 text-gray-900">
                  {item.title}
                </h4>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 Testimonials */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">
            What Our Users Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Freelance Designer",
                quote:
                  "Lancerly helped me land my first 5 clients within two weeks! The AI matching is incredible.",
              },
              {
                name: "David Chen",
                role: "Startup Founder",
                quote:
                  "We found an amazing web developer in hours instead of weeks. Payments are super smooth too.",
              },
              {
                name: "Aisha Khan",
                role: "Data Analyst",
                quote:
                  "The collaboration tools make managing projects so easy — it’s like having an all-in-one office.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg"
              >
                <p className="text-lg italic mb-4 text-white/90">“{t.quote}”</p>
                <h4 className="font-bold text-white">{t.name}</h4>
                <p className="text-sm text-yellow-300">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="py-24 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Join the Future of Freelancing?
          </h2>
          <p className="text-gray-600 mb-8">
            Discover the platform where AI meets opportunity. Grow your career
            or business with Lancerly.
          </p>
          <Button asChild size="lg" className="px-8 py-3 text-lg">
            <Link href="/register" className="flex items-center gap-2">
              Get Started <ArrowRight size={18} />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* 🦶 Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">Lancerly</h3>
            <p className="text-gray-400 max-w-md">
              Empowering freelancers and businesses through AI-driven matching
              and secure collaboration.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-6 text-gray-300">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-10 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Lancerly. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
