"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/AnimatedThemeToggler";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
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
    { icon: <User size={20} />, label: "Profile", href: "/profile" },
    { icon: <BarChart3 size={20} />, label: "Analytics", href: "/analytics" },
    { icon: <Folder size={20} />, label: "Projects", href: "/projects/mine" },
    { icon: <GraduationCap size={20} />, label: "Skills", href: "/skills" },
    { icon: <UserPlus size={20} />, label: "Network", href: "/network" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/landing");
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-20" : "w-0"
        } bg-slate-800 dark:bg-slate-900 border-r border-slate-700 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 flex items-center justify-center border-b border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-2">
          {sidebarItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center justify-center p-3 mx-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors group"
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-slate-800 dark:bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Menu Toggle & Navigation */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/projects/mine"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Projects
                </Link>
                <Link
                  href="/explore"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Planning
                </Link>
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1">
                    Calendar
                    <ChevronDown size={14} />
                  </button>
                </div>
              </nav>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or type command"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 dark:bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Right: Actions & User Menu */}
            <div className="flex items-center gap-3">
              <AnimatedThemeToggler className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" />
              <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Plus size={20} />
              </button>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.name || "User"}</span>
                  <ChevronDown size={14} className={userMenuOpen ? "rotate-180" : ""} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <div className="border-t border-slate-700"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 transition-colors"
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900 dark:bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

