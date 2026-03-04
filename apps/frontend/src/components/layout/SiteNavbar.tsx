"use client";

import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SiteNavbarProps = {
  user?: { name?: string; email?: string; role?: string } | null;
};

export default function SiteNavbar({ user }: SiteNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = user
    ? [
        { href: "/home", label: "Home" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/messages", label: "Messages" },
      ]
    : [
        { href: "/landing", label: "Home" },
        { href: "/hire", label: "Hire Talent" },
        { href: "/about", label: "About" },
      ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-nav shadow-soft"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={user ? "/home" : "/landing"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/25 group-hover:shadow-accent/40 transition-shadow">
              L
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:inline tracking-tight">
              Lancerly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors hover:bg-slate-900/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-accent rounded-xl hover:bg-accent/5 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                {user.name?.split(" ")[0] || "Profile"}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 left-0 right-0 z-50 md:hidden mx-4 mt-2"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-float border border-slate-200/50 p-3 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={16} className="text-slate-300" />
                  </Link>
                ))}
                {!user && (
                  <div className="flex gap-2 pt-2 px-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-center text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
