"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

export default function CategoryPage() {
  const { slug } = useParams();
  const [tab, setTab] = useState<"browse" | "post">("browse");
  const details = CATEGORY_DETAILS[slug as string];

  if (!details) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-gray-900">Category Not Found</h1>
        <p className="text-gray-500 mt-2">
          Sorry, we couldn’t find that category.
        </p>
        <Link href="/" className="mt-6 text-indigo-600 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2">{details.title}</h1>
        <p className="text-white/90 max-w-2xl mx-auto">{details.description}</p>
      </section>

      {/* Tabs */}
      <div className="flex justify-center mt-10 space-x-4">
        <button
          onClick={() => setTab("browse")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            tab === "browse"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-800 border"
          }`}
        >
          🔍 Browse Projects
        </button>
        <button
          onClick={() => setTab("post")}
          className={`px-6 py-2 rounded-full font-medium transition ${
            tab === "post"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-800 border"
          }`}
        >
          ✏️ Post a Project
        </button>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 mt-10 mb-20">
        {tab === "browse" ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg text-gray-900">
                  Example Project #{i}
                </h3>
                <p className="text-gray-600 mt-2">
                  Looking for a skilled freelancer in {details.title.toLowerCase()}.
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">$500 Budget</span>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form className="bg-white p-8 rounded-xl shadow-md space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900">
              Post a New {details.title} Project
            </h2>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Project Title
              </label>
              <input
                type="text"
                placeholder="e.g. Build a React Dashboard"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe your project requirements..."
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Budget ($)
              </label>
              <input
                type="number"
                placeholder="500"
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button className="w-full py-2 text-lg">Post Project</Button>
          </form>
        )}
      </div>
    </main>
  );
}
