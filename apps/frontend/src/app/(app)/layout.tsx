"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "@/app/globals.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [token, loading, router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!token) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}
