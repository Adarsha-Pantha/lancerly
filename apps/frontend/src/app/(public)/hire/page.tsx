"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
const freelancers = [
  {
    name: "Aarav Sharma",
    title: "Full Stack Developer",
    rating: 4.9,
    skills: ["React", "Node.js", "MongoDB"],
    hourlyRate: "$45-65",
    completedJobs: 127
  },
  {
    name: "Sophia Patel",
    title: "Graphic Designer",
    rating: 4.8,
    skills: ["Photoshop", "Illustrator", "Branding"],
    hourlyRate: "$35-50",
    completedJobs: 89
  },
  {
    name: "Liam Wilson",
    title: "Data Scientist",
    rating: 5.0,
    skills: ["Python", "TensorFlow", "SQL"],
    hourlyRate: "$60-80",
    completedJobs: 156
  },
  {
    name: "Emma Chen",
    title: "Mobile App Developer",
    rating: 4.9,
    skills: ["React Native", "Flutter", "iOS"],
    hourlyRate: "$50-70",
    completedJobs: 94
  },
  {
    name: "Marcus Johnson",
    title: "Content Writer",
    rating: 4.7,
    skills: ["SEO", "Technical Writing", "Blog"],
    hourlyRate: "$25-40",
    completedJobs: 213
  },
  {
    name: "Isabella Martinez",
    title: "UI/UX Designer",
    rating: 4.8,
    skills: ["Figma", "Adobe XD", "Prototyping"],
    hourlyRate: "$40-55",
    completedJobs: 76
  }
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
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-blue mb-6"
            >
              Hire Top Talent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-blue/70 max-w-3xl mx-auto leading-relaxed"
            >
              Find verified professionals trusted by hundreds of companies. 
              Browse our curated selection of expert freelancers.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Freelancers Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {freelancers.map((freelancer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg border border-slate-200 bg-white transition-all duration-200 group">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-mint/20 transition-colors">
                        <User className="h-10 w-10 text-mint" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-slate-blue mb-1">{freelancer.name}</h3>
                      <p className="text-slate-blue/70 mb-3">{freelancer.title}</p>
                      
                      <div className="flex justify-center items-center gap-1 mb-3">
                        <Star size={16} className="text-amber-500 fill-current" />
                        <span className="font-medium text-slate-blue">{freelancer.rating}</span>
                        <span className="text-slate-blue/60 text-sm">({freelancer.completedJobs} jobs)</span>
                      </div>
                      
                      <div className="text-center mb-4">
                        <span className="text-lg font-semibold text-mint">{freelancer.hourlyRate}</span>
                        <span className="text-slate-blue/60 text-sm">/hour</span>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {freelancer.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-slate-50 text-slate-blue text-xs px-3 py-1 rounded-full border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full bg-mint hover:bg-mint/90 text-white"
                        onClick={() => handleHire(freelancer.name)}
                      >
                        {token ? "Hire Now" : "Login to Hire"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
            <h2 className="text-3xl font-bold mb-4">Ready to Hire?</h2>
            <p className="text-lg mb-8 opacity-90">
              Post your project and get proposals from top talent within hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-mint font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/dashboard/projects/new"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-mint transition-colors"
              >
                Post a Project
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
