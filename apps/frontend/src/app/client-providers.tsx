"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { needsCompletion } from "@/lib/auth";
import { NotificationProvider, useNotifications } from "@/context/NotificationContext";

// This component manages the lifecycle of the notification connection
function NotificationConnector() {
  const { token } = useAuth();
  const { connect, disconnect } = useNotifications();

  useEffect(() => {
    let isMounted = true;

    if (token) {
      connect(token);
    } else {
      disconnect();
    }

    return () => {
      isMounted = false;
      // Cleanup on unmount or token change
      try {
        disconnect();
      } catch (error) {
        // Ignore errors during cleanup
        console.warn('Error during notification disconnect cleanup:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, connect/disconnect are stable

  return null; // This component does not render anything
}

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

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationConnector />
        <CompletionGuard>
          <Navbar />
          {children}
        </CompletionGuard>
      </NotificationProvider>
    </AuthProvider>
  );
}

