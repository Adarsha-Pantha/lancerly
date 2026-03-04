"use client";

import { useAuth } from "@/context/AuthContext";
import { needsCompletion } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfileSetupWizard from "@/components/onboarding/ProfileSetupWizard";

export default function ProfileSetupPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user?.role === "PENDING") {
      router.replace("/role-selection");
      return;
    }
    if (user && !needsCompletion(user)) {
      router.replace("/profile");
    }
  }, [token, user, router]);

  if (!token) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Complete your profile
          </h1>
          <p className="text-muted-foreground mt-1">
            A complete profile builds trust and helps you get matched with the right opportunities.
          </p>
        </div>
        <ProfileSetupWizard />
      </div>
    </div>
  );
}
