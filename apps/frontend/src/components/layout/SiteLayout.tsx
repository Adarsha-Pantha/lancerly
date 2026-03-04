"use client";

import { useAuth } from "@/context/AuthContext";
import SiteNavbar from "./SiteNavbar";
import SiteFooter from "./SiteFooter";

type SiteLayoutProps = {
  children: React.ReactNode;
  /** Hide footer (e.g. for auth pages) */
  hideFooter?: boolean;
};

/**
 * Universal layout shell: Navbar + main content + Footer.
 * Used for public pages (landing, about, hire, etc.) and auth pages.
 */
export default function SiteLayout({ children, hideFooter }: SiteLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNavbar user={user} />
      <main className="flex-1">{children}</main>
      {!hideFooter && <SiteFooter />}
    </div>
  );
}
