"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const freelancers = [
  {
    name: "Aarav Sharma",
    title: "Full Stack Developer",
    rating: 4.9,
    skills: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "Sophia Patel",
    title: "Graphic Designer",
    rating: 4.8,
    skills: ["Photoshop", "Illustrator", "Branding"],
  },
  {
    name: "Liam Wilson",
    title: "Data Scientist",
    rating: 5.0,
    skills: ["Python", "TensorFlow", "SQL"],
  },
];

export default function HirePage() {
  const { token } = useAuth();
  const router = useRouter();

  const handleHire = (name: string) => {
    if (!token) {
      router.push(`/login?redirect=/hire`);
    } else {
      alert(`You hired ${name}!`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      <section className="py-20 text-center bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 text-white">
        <h1 className="text-5xl font-bold">Hire Top Talent</h1>
        <p className="text-white/80 mt-3">
          Find verified professionals trusted by hundreds of companies.
        </p>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {freelancers.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:shadow-lg border border-indigo-100">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto text-indigo-600" />
                <h2 className="mt-3 text-xl font-semibold">{f.name}</h2>
                <p className="text-gray-600">{f.title}</p>
                <div className="flex justify-center items-center gap-1 mt-2 text-yellow-500">
                  <Star size={16} /> <span>{f.rating}</span>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {f.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Button
                  className="mt-5 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => handleHire(f.name)}
                >
                  {token ? "Hire Now" : "Login to Hire"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
