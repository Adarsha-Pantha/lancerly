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
} from "lucide-react";

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
  const [hydrated, setHydrated] = useState(false); // 👈 New

  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // ✅ Hydration guard (prevents flicker)
  useEffect(() => {
    setHydrated(true);
  }, []);

  // ✅ Close dropdowns when clicking outside
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

  // 🧠 Handle unhydrated or loading state
  if (!hydrated || loading) {
    return (
      <nav className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 text-white shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold">Lancerly</div>
          <div className="animate-pulse h-6 w-28 bg-white/30 rounded-md"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3 shadow-lg">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 md:hidden"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            href="/"
            className="text-2xl font-extrabold text-white tracking-tight hover:opacity-90 transition"
          >
            Lancerly
          </Link>
        </div>

        {/* Center Nav Links */}
        <ul className="hidden md:flex items-center space-x-8 font-medium text-white">
          <li>
            <Link href="/" className="hover:underline underline-offset-4">
              Home
            </Link>
          </li>
          <li>
            <Link href="/explore" className="hover:underline underline-offset-4">
              Explore
            </Link>
          </li>

          {/* Categories Dropdown */}
          <li ref={categoryRef} className="relative">
            <button
              onClick={() => setCategoryOpen((p) => !p)}
              className="flex items-center gap-1 hover:underline underline-offset-4 focus:outline-none"
            >
              Categories <ChevronDown size={14} />
            </button>

            {categoryOpen && (
              <div className="absolute left-0 mt-3 w-56 bg-white text-gray-800 rounded-lg shadow-lg border animate-fadeIn z-50">
                <Link
                  href="/categories/design"
                  className="block px-4 py-2 hover:bg-indigo-50"
                >
                  🎨 Design & Creative
                </Link>
                <Link
                  href="/categories/development"
                  className="block px-4 py-2 hover:bg-indigo-50"
                >
                  💻 Web Development
                </Link>
                <Link
                  href="/categories/writing"
                  className="block px-4 py-2 hover:bg-indigo-50"
                >
                  ✍️ Writing & Translation
                </Link>
                <Link
                  href="/categories/marketing"
                  className="block px-4 py-2 hover:bg-indigo-50"
                >
                  📈 Marketing & Sales
                </Link>
                <Link
                  href="/categories/ai"
                  className="block px-4 py-2 hover:bg-indigo-50"
                >
                  🤖 AI & Data Science
                </Link>
              </div>
            )}
          </li>

          <li>
            <Link href="/find-work" className="hover:underline underline-offset-4">
              Find Work
            </Link>
          </li>
          <li>
            <Link href="/hire" className="hover:underline underline-offset-4">
              Hire Talent
            </Link>
          </li>
          <li>
            <Link
              href="/ai-discover"
              className="flex items-center gap-1 hover:underline underline-offset-4"
            >
              <Sparkles size={16} /> AI Discover
            </Link>
          </li>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-md border border-white text-white hover:bg-white hover:text-indigo-700 transition font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-md bg-white text-indigo-700 font-semibold hover:bg-gray-100 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={toPublicUrl(user.avatarUrl) || fallback}
                  alt={user.name || "User"}
                  className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm hover:scale-105 transition"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-xl bg-white text-gray-800 shadow-xl border animate-fadeIn z-50">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-indigo-50 rounded-t-xl"
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-indigo-50"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 rounded-b-xl"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar (Mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-indigo-600">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <ul className="p-4 space-y-4 text-gray-800 font-medium">
          <li>
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/explore" onClick={() => setSidebarOpen(false)}>
              Explore
            </Link>
          </li>
          <li>
            <Link href="/find-work" onClick={() => setSidebarOpen(false)}>
              Find Work
            </Link>
          </li>
          <li>
            <Link href="/hire" onClick={() => setSidebarOpen(false)}>
              Hire Talent
            </Link>
          </li>
          <li>
            <Link href="/ai-discover" onClick={() => setSidebarOpen(false)}>
              AI Discover
            </Link>
          </li>
          {user && (
            <li>
              <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                Profile
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
