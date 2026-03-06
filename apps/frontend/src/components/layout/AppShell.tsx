"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  ChevronDown,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  User,
  Menu,
  X,
  Home,
} from "lucide-react";
import { SIDEBAR_NAV, getPrimaryCta } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";
import SmartMatchingSidebar from "@/components/dashboard/SmartMatchingSidebar";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

function toPublicUrl(p?: string | null) {
  if (!p) return "";
  return /^https?:\/\//i.test(p) ? p : `${API_BASE}${p}`;
}

type AppShellProps = {
  children: React.ReactNode;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
};

export default function AppShell({ children, role }: AppShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  const primaryCta = getPrimaryCta(role);
  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "User")}`;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Collapsible, hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-[#E2E8F0] bg-[#F1F5F9] transition-all duration-300 ease-in-out z-30",
          sidebarCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold shrink-0">
              L
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-foreground truncate">Lancerly</span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {SIDEBAR_NAV.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-[#7C3AED] text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeft size={20} className="shrink-0" />
            ) : (
              <>
                <PanelLeftClose size={20} className="shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - Navbar (different from sidebar): Home + work CTA */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between gap-2 md:gap-4 px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link
              href="/home"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Home size={18} />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-[0_2px_8px_rgba(124,58,237,0.3)] shrink-0"
            >
              <primaryCta.icon size={18} className="shrink-0" />
              {primaryCta.label}
            </Link>
          </div>

          {/* Search - hidden on small screens */}
          <div className="hidden sm:flex flex-1 max-w-md min-w-[120px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, freelancers..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <img
                  src={toPublicUrl(user?.avatarUrl) || fallbackAvatar}
                  alt={user?.name || "User"}
                  className="w-9 h-9 rounded-lg object-cover ring-2 ring-border"
                />
                <ChevronDown
                  size={16}
                  className={cn("text-muted-foreground transition-transform", userMenuOpen && "rotate-180")}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-medium text-foreground truncate">{user?.name || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <User size={16} className="shrink-0" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content + optional right sidebar */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">{children}</main>
          {role !== "ADMIN" && (
            <aside className="hidden xl:block w-80 shrink-0 border-l border-border overflow-y-auto">
              <SmartMatchingSidebar role={role} />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 md:hidden animate-slide-in-left flex flex-col shadow-xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <span className="font-semibold text-foreground">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {SIDEBAR_NAV.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon size={20} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

