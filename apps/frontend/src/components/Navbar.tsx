"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  Home,
  Compass,
  Rss,
  Briefcase,
  Search,
  MessageCircle,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(
  /\/+$/,
  ""
);

function toPublicUrl(p?: string | null) {
  if (!p) return "";
  return /^https?:\/\//i.test(p) ? p : `${API}${p}`;
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setCategoryOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    user?.name || "User"
  )}`;

  if (!hydrated || loading) {
    return (
      <>
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-2xl font-bold gradient-text">Lancerly</div>
              <div className="animate-pulse h-8 w-32 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
              >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link
                href="/"
                className="text-2xl font-bold gradient-text tracking-tight hover:opacity-90 transition"
              >
                Lancerly
              </Link>
            </div>

            {/* Center Nav Links */}
            <ul className="hidden md:flex items-center gap-1">
              <li>
                <Link
                  href="/explore"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  <Compass size={16} />
                  Explore
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link
                      href="/feed"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <Rss size={16} />
                      Feed
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/friends"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <User size={16} />
                      Friends
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/messages"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <MessageCircle size={16} />
                      Messages
                    </Link>
                  </li>
                </>
              )}

              {/* Categories Dropdown */}
              <li ref={categoryRef} className="relative">
                <button
                  onClick={() => setCategoryOpen((p) => !p)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  Categories
                  <ChevronDown size={14} className={categoryOpen ? "rotate-180" : ""} />
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 mt-2 w-64 glass-effect rounded-xl shadow-soft border border-slate-200 animate-fadeIn z-50 overflow-hidden">
                    <Link
                      href="/categories/design"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">🎨</span>
                      <span className="font-medium text-slate-700">Design & Creative</span>
                    </Link>
                    <Link
                      href="/categories/development"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">💻</span>
                      <span className="font-medium text-slate-700">Web Development</span>
                    </Link>
                    <Link
                      href="/categories/writing"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">✍️</span>
                      <span className="font-medium text-slate-700">Writing & Translation</span>
                    </Link>
                    <Link
                      href="/categories/marketing"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">📈</span>
                      <span className="font-medium text-slate-700">Marketing & Sales</span>
                    </Link>
                    <Link
                      href="/categories/ai"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                    >
                      <span className="text-xl">🤖</span>
                      <span className="font-medium text-slate-700">AI & Data Science</span>
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <Link
                  href="/find-work"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  Find Work
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    href="/projects/mine"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                  >
                    <Briefcase size={16} />
                    My Projects
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/hire"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  Hire Talent
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-discover"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  <Sparkles size={16} />
                  AI Discover
                </Link>
              </li>
            </ul>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects, freelancers..."
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user && <NotificationBell />}
              {user && (
                <Link
                  href="/settings"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  <Settings size={16} />
                  Settings
                </Link>
              )}
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex items-center gap-2 focus:outline-none rounded-full hover:ring-2 hover:ring-purple-200 transition-all"
                  >
                    <img
                      src={toPublicUrl(user.avatarUrl) || fallback}
                      alt={user.name || "User"}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-200 shadow-sm"
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 glass-effect rounded-xl shadow-soft border border-slate-200 animate-fadeIn z-50 overflow-hidden">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                      >
                        <User size={18} className="text-slate-600" />
                        <span className="font-medium text-slate-700">Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                      >
                        <Settings size={18} className="text-slate-600" />
                        <span className="font-medium text-slate-700">Settings</span>
                      </Link>
                      <div className="border-t border-slate-200"></div>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 glass-effect border-r border-slate-200 shadow-2xl transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold gradient-text">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Mobile Search */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search projects, freelancers..."
              className="w-full pl-11 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
        <ul className="p-4 space-y-2">
          {[
            { href: "/", label: "Home", icon: <Home size={18} /> },
            { href: "/explore", label: "Explore", icon: <Compass size={18} /> },
            ...(user ? [{ href: "/feed", label: "Feed", icon: <Rss size={18} /> }] : []),
            ...(user ? [{ href: "/friends", label: "Friends", icon: <User size={18} /> }] : []),
            ...(user ? [{ href: "/messages", label: "Messages", icon: <MessageCircle size={18} /> }] : []),
            { href: "/find-work", label: "Find Work", icon: <Briefcase size={18} /> },
            ...(user ? [{ href: "/projects/mine", label: "My Projects", icon: <Briefcase size={18} /> }] : []),
            { href: "/hire", label: "Hire Talent" },
            { href: "/ai-discover", label: "AI Discover", icon: <Sparkles size={18} /> },
            ...(user ? [
              { href: "/profile", label: "Profile", icon: <User size={18} /> },
              { href: "/settings", label: "Settings", icon: <Settings size={18} /> },
            ] : []),
          ].map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-slate-700 font-medium hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all"
              >
                {item.icon && <span className="text-slate-500">{item.icon}</span>}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
