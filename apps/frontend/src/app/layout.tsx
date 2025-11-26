"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { needsCompletion } from "@/lib/auth";

function CompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // wait until auth is ready
    if (!token) return; // not logged in → no redirect

    const allowed = ["/login", "/register", "/oauth"];
    if (allowed.some((p) => pathname?.startsWith(p))) return;

    if (pathname?.startsWith("/profile/setup")) return;

    if (needsCompletion(user)) {
      router.replace("/profile/setup");
    }
  }, [token, user, pathname, router, loading]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      /* no-op */
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <CompletionGuard>
            <Navbar />
            {children}
          </CompletionGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
