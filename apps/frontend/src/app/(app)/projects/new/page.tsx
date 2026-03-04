"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PostProjectWizard from "@/components/projects/PostProjectWizard";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  if (!token || !user) {
    router.replace("/login?redirect=/projects/new");
    return null;
  }

  if (user.role !== "CLIENT") {
    router.replace("/projects");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/projects/mine"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to My Projects
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Post a Project
          </h1>
          <p className="text-muted-foreground mt-1">
            Describe what you need and we&apos;ll help you find the right freelancers.
          </p>
        </div>

        <PostProjectWizard />
      </div>
    </div>
  );
}
