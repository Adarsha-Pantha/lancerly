"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <section className="py-24 text-center bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <Sparkles className="mx-auto w-10 h-10 mb-4 text-yellow-300" />
        <h1 className="text-5xl font-bold">AI Discover</h1>
        <p className="text-white/80 mt-3 text-lg">
          Smart AI that connects freelancers and clients instantly.
        </p>
      </section>

      <section className="max-w-4xl mx-auto py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-10 rounded-2xl shadow-lg bg-white/90 border border-indigo-100"
        >
          <Brain className="mx-auto w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover the Future of Hiring
          </h2>
          <p className="text-gray-600 mb-6">
            AI-powered algorithms analyze your profile, skills, and preferences
            to deliver the perfect matches in seconds.
          </p>

          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleTry}
          >
            {token ? "Start AI Matching" : "Login to Try"}
          </Button>
        </motion.div>

        <div className="mt-16 flex justify-center gap-6 flex-wrap">
          <div className="p-6 bg-indigo-50 rounded-xl w-64 text-center">
            <LineChart className="mx-auto text-indigo-600 mb-2" />
            <p className="font-semibold text-gray-800">Skill-Based Ranking</p>
            <p className="text-sm text-gray-500">
              AI prioritizes verified experience and reputation.
            </p>
          </div>
          <div className="p-6 bg-indigo-50 rounded-xl w-64 text-center">
            <Sparkles className="mx-auto text-indigo-600 mb-2" />
            <p className="font-semibold text-gray-800">Smart Recommendations</p>
            <p className="text-sm text-gray-500">
              Personalized results that evolve with your activity.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
