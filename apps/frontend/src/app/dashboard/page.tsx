"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import FreelancerDashboard from "@/components/dashboard/FreelancerDashboard";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token || !user) return null;

  if (user.role === "CLIENT") {
    return <ClientDashboard />;
  }

  if (user.role === "FREELANCER") {
    return <FreelancerDashboard />;
  }

  // Admin or fallback
  return <FreelancerDashboard />;
}

