"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Globe2,
  PenTool,
  Megaphone,
  Code,
  BarChart,
  Brain,
  Palette,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const categories = [
  { name: "Web Development", icon: <Code />, desc: "Frontend, backend & full-stack experts" },
  { name: "Design & Creative", icon: <Palette />, desc: "Logos, UI/UX, animation & more" },
  { name: "Writing & Translation", icon: <PenTool />, desc: "Blogs, copywriting & localization" },
  { name: "Marketing & SEO", icon: <Megaphone />, desc: "Ads, social media & SEO pros" },
  { name: "AI & Data Science", icon: <Brain />, desc: "AI engineers, ML ops & data analysts" },
  { name: "Business & Finance", icon: <BarChart />, desc: "Financial modeling, business plans" },
  { name: "IT & Cybersecurity", icon: <Globe2 />, desc: "Networking, ethical hacking, IT support" },
];

export default function ExplorePage() {
  const { token } = useAuth();
  const router = useRouter();

  const handleAction = (href: string) => {
    if (!token) {
      router.push(`/login?redirect=${href}`);
    } else {
      router.push(href);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Header */}
      <section className="py-20 text-center bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold"
        >
          Explore Categories
        </motion.h1>
        <p className="text-white/80 mt-3 text-lg">
          Browse top freelance talent in every field.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="flex bg-white rounded-full shadow-lg overflow-hidden w-full max-w-lg">
            <input
              type="text"
              placeholder="Search skills, roles, or categories..."
              className="flex-1 px-5 py-3 text-gray-800 outline-none"
            />
            <Button className="rounded-none bg-indigo-600 hover:bg-indigo-700">
              <Search className="w-5 h-5 mr-1" /> Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Popular Categories
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl transition border border-indigo-100 bg-white/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center text-center space-y-3">
                  <div className="text-indigo-600 text-3xl">{cat.icon}</div>
                  <h3 className="text-xl font-semibold">{cat.name}</h3>
                  <p className="text-gray-600 text-sm">{cat.desc}</p>
                  <Button
                    onClick={() =>
                      handleAction(`/categories/${cat.name.toLowerCase().replace(/ & | /g, "-")}`)
                    }
                    variant="outline"
                    className="mt-3"
                  >
                    {token ? "View Experts" : "Login to View"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
