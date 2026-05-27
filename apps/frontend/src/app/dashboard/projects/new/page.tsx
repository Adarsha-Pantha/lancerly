"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PostProjectWizard from "@/components/projects/PostProjectWizard";
import { useEffect } from "react";

export default function PostProjectPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.replace("/login?redirect=/dashboard/projects/new");
      return;
    }
    if (user.role !== "CLIENT") {
      router.replace("/dashboard");
    }
  }, [token, user, router]);

  if (!token || !user) return null;
  if (user.role !== "CLIENT") return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <PostProjectWizard onSuccessRedirect="/dashboard/projects/mine" />
    </div>
  );
}
