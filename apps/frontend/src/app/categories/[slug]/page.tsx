"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, ChevronRight, ArrowRight } from "lucide-react";

const CATEGORY_DETAILS: Record<string, { title: string; description: string }> = {
  development: {
    title: "Web Development",
    description:
      "Discover the best freelance developers to build your next app, website, or digital product.",
  },
  design: {
    title: "Design & Creative",
    description:
      "Hire talented designers for branding, UI/UX, animation, and more.",
  },
  writing: {
    title: "Writing & Translation",
    description:
      "Find expert writers, translators, and content creators to make your ideas shine.",
  },
  marketing: {
    title: "Marketing & Sales",
    description:
      "Boost your growth with skilled marketers and lead-generation experts.",
  },
  ai: {
    title: "AI & Data Science",
    description:
      "Work with AI engineers, data scientists, and ML experts for cutting-edge projects.",
  },
};

const V  = "#4f3fe0";
const VL = "#f0effd";

const DEMO_PROJECTS = [
  {
    id: 1,
    title: "Build a Full-Stack E-Commerce Platform",
    description:
      "We need an experienced developer to build a scalable e-commerce platform with product listings, cart, checkout, and admin dashboard. Must have experience with React and Node.js.",
    budget: "$800 – $1,200",
    posted: "2 hours ago",
    proposals: 4,
    skills: ["React", "Node.js", "PostgreSQL", "Stripe"],
  },
  {
    id: 2,
    title: "Redesign Landing Page for SaaS Product",
    description:
      "Looking for a frontend developer to revamp our existing landing page. The goal is to improve conversion rates with a modern, responsive design. Figma designs will be provided.",
    budget: "$300 – $500",
    posted: "5 hours ago",
    proposals: 11,
    skills: ["Next.js", "Tailwind CSS", "Figma"],
  },
  {
    id: 3,
    title: "REST API Integration for Mobile App",
    description:
      "Our mobile team needs a backend developer to build and integrate REST APIs with our existing iOS and Android app. Authentication, push notifications, and real-time features required.",
    budget: "$500 – $900",
    posted: "1 day ago",
    proposals: 7,
    skills: ["Node.js", "REST API", "Firebase", "JWT"],
  },
  {
    id: 4,
    title: "WordPress to Next.js Migration",
    description:
      "Migrate a content-heavy WordPress blog to a Next.js application with a headless CMS. SEO and page speed are top priorities. The site has roughly 200 pages.",
    budget: "$600 – $1,000",
    posted: "2 days ago",
    proposals: 9,
    skills: ["Next.js", "WordPress", "Contentful", "SEO"],
  },
];

const DEMO_SKILLS = [
  "React", "Node.js", "Next.js", "TypeScript", "Python",
  "PostgreSQL", "MongoDB", "Tailwind CSS", "GraphQL", "AWS",
  "Docker", "REST API", "Firebase", "Vue.js", "Express.js",
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [tab, setTab] = useState<"browse" | "post">("browse");
  const details = CATEGORY_DETAILS[slug as string];

  if (!details) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Not Found</h1>
        <p className="text-gray-500 mt-2 mb-6">Sorry, we couldn't find that category.</p>
        <Link href="/" className="text-sm font-semibold" style={{ color: V }}>← Go back home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">

      {/* ── Header band ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-medium">{details.title}</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{details.title}</h1>
          <p className="text-gray-500 text-base max-w-xl">{details.description}</p>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-0">
          {(["browse", "post"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="pb-3.5 px-1 mr-8 text-sm font-semibold border-b-2 transition-all duration-150"
              style={{
                borderColor: tab === t ? V : "transparent",
                color: tab === t ? V : "#6b7280",
              }}
            >
              {t === "browse" ? "Browse Projects" : "Post a Project"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {tab === "browse" ? (

          <div className="flex gap-7 items-start">

            {/* ── Project list ── */}
            <div className="flex-1 min-w-0 space-y-4">
              {DEMO_PROJECTS.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-150 cursor-pointer group"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#4f3fe0] transition-colors">
                      {project.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Open
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-5 text-sm text-gray-400">
                      <span className="font-semibold text-gray-800">{project.budget}</span>
                      <span>·</span>
                      <span>{project.proposals} proposals</span>
                      <span>·</span>
                      <span>Posted {project.posted}</span>
                    </div>
                    <button
                      className="h-9 px-6 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
                      style={{ background: V }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Skills sidebar ── */}
            <div className="w-64 shrink-0 hidden lg:block">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {DEMO_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:border-[#4f3fe0] hover:text-[#4f3fe0] hover:bg-[#f0effd] transition-all duration-150"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        ) : (

          <div className="max-w-2xl">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Post a New {details.title} Project
              </h2>

              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Build a React Dashboard"
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#4f3fe0] focus:ring-2 focus:ring-[#4f3fe0]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your project requirements..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors resize-none focus:border-[#4f3fe0] focus:ring-2 focus:ring-[#4f3fe0]/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Budget (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                    <input
                      type="number"
                      placeholder="500"
                      className="w-full h-11 pl-7 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#4f3fe0] focus:ring-2 focus:ring-[#4f3fe0]/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 mt-1"
                  style={{ background: V }}
                >
                  Post Project
                </button>
              </form>
            </div>
          </div>

        )}
      </div>
    </main>
  );
}