"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Folder,
  GraduationCap,
  UserPlus,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  MessageCircle,
  Send,
} from "lucide-react";
import SmartMatchingSidebar from "./SmartMatchingSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Folder size={20} />, label: "My Projects", href: "/dashboard/projects/mine" },
    { icon: <Search size={20} />, label: "Browse Projects", href: "/dashboard/browse" },
    { icon: <MessageCircle size={20} />, label: "Messages", href: "/messages" },
    { icon: <Send size={20} />, label: "Proposals", href: "/proposals/me" },
    { icon: <FileText size={20} />, label: "Contracts", href: "/contracts/me" },
    { icon: <User size={20} />, label: "Profile", href: "/profile" },
    { icon: <BarChart3 size={20} />, label: "Analytics", href: "/analytics" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  const primaryCta =
    role === "CLIENT" ? (
      <Link
        href="/dashboard/projects/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#A78BFA] transition-all shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.4)]"
      >
        <Plus size={18} />
        Post Project
      </Link>
    ) : (
      <Link
        href="/dashboard/browse"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#A78BFA] transition-all shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.4)]"
      >
        <FileText size={18} />
        Find Work
      </Link>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      <aside
        className={`${
          sidebarOpen ? "w-20" : "w-0"
        } bg-[#F0F3F9] border-r border-[#E2E8F0] transition-all duration-300 overflow-hidden flex flex-col shrink-0`}
      >
        <div className="p-4 flex items-center justify-center border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-2">
          {sidebarItems.map((item, idx) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-center p-3 mx-2 rounded-xl transition-colors min-h-[44px] ${
                  isActive
                    ? "bg-[#7C3AED] text-white"
                    : "text-[#64748B] hover:text-[#2C304B] hover:bg-[#E2E8F0]"
                }`}
                title={item.label}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main + Right Sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar – Clean, minimal */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl text-[#64748B] hover:text-[#2C304B] hover:bg-[#F1F5F9] transition-colors min-h-[44px] min-w-[44px]"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard/projects/mine"
                  className="px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded-xl transition-colors"
                >
                  My Projects
                </Link>
                <Link
                  href="/dashboard/browse"
                  className="px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded-xl transition-colors"
                >
                  Browse Projects
                </Link>
                <Link
                  href="/messages"
                  className="px-4 py-2.5 text-sm font-medium text-[#64748B] hover:text-[#7C3AED] hover:bg-[#F5F3FF] rounded-xl transition-colors"
                >
                  Messages
                </Link>
              </nav>
              {/* Prominent CTA – scannable */}
              {primaryCta}
            </div>

            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or type command"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl text-[#64748B] hover:text-[#2C304B] hover:bg-[#F1F5F9] transition-colors relative min-h-[44px] min-w-[44px]">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#10B981] rounded-full"></span>
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-[#1E293B]">
                    {user?.name || "User"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-50 overflow-hidden">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <div className="border-t border-[#E2E8F0]"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[#F43F5E] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content + Smart Matching Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA] min-w-0">{children}</main>
          {/* {role !== "ADMIN" && <SmartMatchingSidebar role={role} />} */}
        </div>
      </div>
    </div>
  );
}
