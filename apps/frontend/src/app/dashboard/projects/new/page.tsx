"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PostProjectWizard from "@/components/projects/PostProjectWizard";

export default function PostProjectPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  if (!token || !user) {
    router.replace("/login?redirect=/dashboard/projects/new");
    return null;
  }

  if (user.role !== "CLIENT") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <PostProjectWizard onSuccessRedirect="/dashboard/projects/mine" />
    </div>
  );
}
