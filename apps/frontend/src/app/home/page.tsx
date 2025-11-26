"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Briefcase,
  User,
  MessageSquare,
  Bell,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function HomePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/landing");
  }, [token, router]);

  if (!token) return null;

  const quickActions = [
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "My Projects",
      desc: "Track and manage the projects you've posted or applied for.",
      link: "/projects/mine",
      btn: "View Projects",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Profile",
      desc: "Keep your information up to date and showcase your skills.",
      link: "/profile",
      btn: "Edit Profile",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Messages",
      desc: "Communicate and collaborate with clients or freelancers easily.",
      link: "/messages",
      btn: "Open Chat",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Notifications",
      desc: "Stay informed about updates, proposals, and new invites.",
      link: "/notifications",
      btn: "View Alerts",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Top Rated",
      desc: "Your performance rating and badges from satisfied clients.",
      link: "/ratings",
      btn: "View Ratings",
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-50 to-amber-50",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Growth Insights",
      desc: "Get AI-powered analytics and recommendations for your next gig.",
      link: "/insights",
      btn: "View Insights",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Hero Section */}
        <section className="relative mb-16 h-[70vh] rounded-3xl overflow-hidden shadow-glow animate-slideUp">
          <AnimatedShaderBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 flex flex-col items-center justify-center text-center px-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-6 text-white">
              <Sparkles className="text-white" size={18} />
              <span className="text-sm font-semibold tracking-wide">Welcome Back!</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
              Hello, <span className="text-purple-200">{user?.name || "User"}</span> 👋
            </h1>
            <p className="text-lg md:text-xl text-slate-100 max-w-3xl mb-6">
              Manage your projects, messages, and grow your freelance journey with AI-powered insights.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => router.push("/projects/new")}
                className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Create Project
              </button>
              <button
                onClick={() => router.push("/feed")}
                className="px-6 py-3 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all hover:scale-105"
              >
                Explore Feed
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {quickActions.map((item, i) => (
            <div
              key={i}
              className={`group relative bg-gradient-to-br ${item.bgGradient} rounded-2xl p-6 shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-[1.02] animate-slideUp`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white mb-4 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">{item.desc}</p>
              <button
                onClick={() => router.push(item.link)}
                className={`group/btn flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-gradient-to-r hover:${item.gradient} hover:text-white transition-all shadow-md hover:shadow-lg`}
              >
                <span>{item.btn}</span>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="glass-effect rounded-2xl shadow-soft p-8 md:p-12 animate-slideUp">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Performance Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { label: "Active Projects", value: "12", color: "from-blue-500 to-cyan-500" },
              { label: "Proposals Sent", value: "23", color: "from-purple-500 to-pink-500" },
              { label: "Average Rating", value: "4.9", suffix: "★", color: "from-yellow-500 to-orange-500" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`inline-block text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
