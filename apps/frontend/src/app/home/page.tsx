"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  User,
  MessageSquare,
  Bell,
  Star,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Redirect guest users back to public landing page
  useEffect(() => {
    if (!token) router.replace("/landing");
  }, [token, router]);

  if (!token) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 👋 Welcome */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Welcome back,{" "}
            <span className="text-indigo-600">{user?.name || "User"}</span> 👋
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Manage your projects, messages, and grow your freelance journey with
            AI-powered insights.
          </p>
        </div>

        {/* ⚡ Quick Actions */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Briefcase className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "My Projects",
              desc: "Track and manage the projects you’ve posted or applied for.",
              link: "/projects",
              btn: "View Projects",
              primary: true,
            },
            {
              icon: <User className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "Profile",
              desc: "Keep your information up to date and showcase your skills.",
              link: "/profile",
              btn: "Edit Profile",
              primary: false,
            },
            {
              icon: <MessageSquare className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "Messages",
              desc: "Communicate and collaborate with clients or freelancers easily.",
              link: "/messages",
              btn: "Open Chat",
              primary: false,
            },
            {
              icon: <Bell className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "Notifications",
              desc: "Stay informed about updates, proposals, and new invites.",
              link: "/notifications",
              btn: "View Alerts",
              primary: true,
            },
            {
              icon: <Star className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "Top Rated",
              desc: "Your performance rating and badges from satisfied clients.",
              link: "/ratings",
              btn: "View Ratings",
              primary: false,
            },
            {
              icon: <TrendingUp className="h-10 w-10 text-indigo-600 mb-3" />,
              title: "Growth Insights",
              desc: "Get AI-powered analytics and recommendations for your next gig.",
              link: "/insights",
              btn: "View Insights",
              primary: true,
            },
          ].map((item, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition border border-indigo-100 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                {item.icon}
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h2>
                <p className="text-gray-600 mt-2">{item.desc}</p>
                <button
                  onClick={() => router.push(item.link)}
                  className={`mt-4 px-4 py-2 text-sm font-medium rounded-lg transition ${
                    item.primary
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {item.btn}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 📊 Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold text-indigo-600">12</h4>
              <p className="text-gray-600 mt-2 font-medium">Active Projects</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-indigo-600">23</h4>
              <p className="text-gray-600 mt-2 font-medium">Proposals Sent</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-indigo-600">4.9★</h4>
              <p className="text-gray-600 mt-2 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
