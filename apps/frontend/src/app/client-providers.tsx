"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { needsCompletion } from "@/lib/auth";
import { NotificationProvider, useNotifications } from "@/context/NotificationContext";
import { ToastProvider } from "@/context/ToastContext";

/** Dashboard workspace routes - work section only. Profile/Settings and /home use main Navbar. */
const APP_SHELL_ROUTES = [
  "/dashboard",
  "/projects",
  "/contracts",
  "/proposals",
  "/messages",
  "/friends",
  "/analytics",
  "/skills",
  "/network",
  "/users",
];

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
    
    // Admin routes protection
    if (pathname?.startsWith("/admin")) {
      const adminPublicRoutes = ["/admin/login", "/admin/register"];
      if (adminPublicRoutes.some((p) => pathname?.startsWith(p))) {
        // Allow access to admin login/register
        if (token && user?.role === "ADMIN") {
          router.replace("/admin/dashboard");
        }
        return;
      }
      // Protect admin routes
      if (!token || user?.role !== "ADMIN") {
        router.replace("/admin/login");
        return;
      }
      return;
    }

    // Regular user routes
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

function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, token } = useAuth();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isPublicRoute =
    pathname?.startsWith("/landing") ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/contact") ||
    pathname?.startsWith("/hire") ||
    pathname?.startsWith("/ai-discover") ||
    pathname?.startsWith("/projects/browse") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register");

  const useAppShell =
    token &&
    user &&
    user.role !== "PENDING" &&
    !isAdminRoute &&
    !isPublicRoute &&
    APP_SHELL_ROUTES.some((r) => pathname?.startsWith(r) || pathname === r);

  if (useAppShell && user?.role) {
    const role = user.role === "CLIENT" || user.role === "FREELANCER" ? user.role : "FREELANCER";
    return <AppShell role={role}>{children}</AppShell>;
  }

  return (
    <>
      {!isAdminRoute && !isPublicRoute && <Navbar />}
      {children}
    </>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <NotificationConnector />
          <CompletionGuard>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </CompletionGuard>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

