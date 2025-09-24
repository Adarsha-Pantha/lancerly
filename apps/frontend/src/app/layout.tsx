// apps/frontend/src/app/layout.tsx
"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { needsCompletion } from "@/lib/auth";

function CompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) return; // not logged in, no redirect needed

    // ✅ allow certain routes even if incomplete
    const allowed = ["/login", "/register", "/oauth"];
    if (allowed.some((p) => pathname?.startsWith(p))) return;

    // ✅ allow setup page itself
    if (pathname?.startsWith("/profile/setup")) return;

    // ✅ redirect to setup if profile incomplete
    if (needsCompletion(user)) {
      router.replace("/profile/setup");
    }
  }, [token, user, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
