"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { needsCompletion, needsRoleSelection } from "@/lib/auth";

export default function IndexRedirect() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/landing");
      return;
    }

    if (user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    if (needsRoleSelection(user)) {
      router.replace("/role-selection");
    } else if (needsCompletion(user)) {
      router.replace("/profile/setup");
    } else {
      router.replace("/home");
    }
  }, [token, user, router]);

  return null;
}
