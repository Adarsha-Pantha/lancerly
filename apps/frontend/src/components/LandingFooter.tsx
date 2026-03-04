"use client";

import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0F172A] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/landing" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white text-sm font-bold">
              L
            </span>
            <span className="text-lg font-bold text-white">Lancerly</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/about" className="text-sm text-white/80 hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-white/80 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="text-sm text-white/80 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} Lancerly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
