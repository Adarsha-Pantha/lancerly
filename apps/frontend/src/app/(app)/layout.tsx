"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/Footer";

export default function AppLayout({ 
  children,
  modal
}: { 
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const { token, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
      return;
    }
    if (token && user?.role === "PENDING") {
      router.replace("/role-selection");
    }
  }, [token, user?.role, loading, router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!token) return null;
  if (user?.role === "PENDING") return null;

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {modal}
    </div>
  );
}
