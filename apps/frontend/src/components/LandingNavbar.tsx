"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/landing", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects/browse", label: "Projects" },
  { href: "/hire", label: "Hire" },
  { href: "/contact", label: "Contact" },
];

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/landing"
            className="flex items-center gap-3 text-2xl font-bold text-primary tracking-tight hover:opacity-90 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-cta group-hover:scale-110 transition-transform">
              <span className="text-xl font-black">L</span>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Lancerly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-semibold text-muted-foreground hover:text-accent transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="px-4 py-2 text-[15px] font-semibold text-primary hover:text-accent transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn-primary py-2.5"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-primary hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-lg font-semibold text-primary hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3.5 text-center font-bold text-primary rounded-xl border-2 border-border hover:bg-secondary transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3.5 text-center font-bold bg-accent text-white rounded-xl shadow-cta hover:bg-accent-hover transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
