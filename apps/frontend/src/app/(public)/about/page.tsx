"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, Target, Shield, Globe } from "lucide-react";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    bio: "Visionary leader with 10+ years in freelance marketplace innovation.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  },
  {
    name: "Michael Chen",
    role: "CTO",
    bio: "Tech expert specializing in AI and scalable platform architecture.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
  },
  {
    name: "Emily Davis",
    role: "Head of Operations",
    bio: "Operational excellence expert ensuring smooth platform experiences.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
  },
  {
    name: "Alex Rivera",
    role: "Lead Designer",
    bio: "Creative mind behind our intuitive and beautiful user interface.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
  }
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to empowering freelancers and businesses to connect and thrive together."
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your safety and security are our top priorities with robust protection measures."
  },
  {
    icon: Users,
    title: "Community First",
    description: "We build our platform around the needs of our diverse global community."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connecting talent and opportunities across borders without limitations."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-mint/5">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* <Link
              href="/landing"
              className="inline-flex items-center gap-2 text-slate-blue hover:text-mint transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link> */}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-blue mb-6"
            >
              About Lancerly
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-blue/70 max-w-3xl mx-auto leading-relaxed"
            >
              We're on a mission to revolutionize the freelance industry with AI-powered matching,
              secure payments, and a platform that truly serves both freelancers and clients.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-blue mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-blue/70 leading-relaxed">
                <p>
                  Founded in 2024, Lancerly emerged from a simple observation: the freelance industry
                  was broken. Platforms took huge commissions, matching was inefficient, and trust
                  was hard to come by.
                </p>
                <p>
                  Our founders, themselves veteran freelancers and clients, decided to build something
                  better. A platform that uses cutting-edge AI to make perfect matches, that protects
                  both parties with smart contracts and escrow, and that puts community first.
                </p>
                <p>
                  Today, we're proud to serve thousands of freelancers and businesses worldwide,
                  facilitating successful collaborations and building the future of work.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-blue mb-4">Our Values</h2>
            <p className="text-xl text-slate-blue/70">The principles that guide everything we do</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center text-mint mx-auto mb-4">
                  <value.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-blue mb-2">{value.title}</h3>
                <p className="text-slate-blue/70 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-blue mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-blue/70">The passionate people behind Lancerly</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-blue mb-1">{member.name}</h3>
                <p className="text-mint font-medium text-sm mb-2">{member.role}</p>
                <p className="text-slate-blue/70 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Join Our Community?</h2>
            <p className="text-lg mb-8 text-violet-100">
              Become part of the future of freelance work. Sign up today and experience the Lancerly difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/projects/browse"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-violet-600 transition-colors"
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