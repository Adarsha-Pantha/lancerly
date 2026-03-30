import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

/**
 * Unified footer for public/marketing pages.
 * Updated to a clean, modern aesthetic: white background, slate text.
 */
export default function SiteFooter() {
  const BRAND = "#7739DB";

  return (
    <footer className="bg-white border-t border-slate-100 py-16 text-slate-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: BRAND }}>
                L
              </span>
              <span className="text-xl font-bold text-slate-800 tracking-tight">Lancerly</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering the world's best talent to do their most impactful work for ambitious companies.
            </p>
          </div>

          {/* Links sections - simplified for public pages */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/projects/browse" className="hover:text-[#7739DB] transition-colors">Find Projects</Link></li>
              <li><Link href="/hire" className="hover:text-[#7739DB] transition-colors">Hire Talent</Link></li>
              <li><Link href="/categories" className="hover:text-[#7739DB] transition-colors">Categories</Link></li>
              <li><Link href="/ai-discover" className="hover:text-[#7739DB] transition-colors">AI Matching</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#7739DB] transition-colors">Our Story</Link></li>
              <li><Link href="/blog" className="hover:text-[#7739DB] transition-colors">Press</Link></li>
              <li><Link href="/contact" className="hover:text-[#7739DB] transition-colors">Contact Us</Link></li>
              <li><Link href="/careers" className="hover:text-[#7739DB] transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-[#7739DB] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#7739DB] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/trust" className="hover:text-[#7739DB] transition-colors">Trust & Safety</Link></li>
              <li><Link href="/cookies" className="hover:text-[#7739DB] transition-colors">Cookie Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Lancerly. All rights reserved. The future of work is decentralized.
          </p>
          
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-[#7739DB] transition-colors"><Twitter size={18} /></Link>
            <Link href="#" className="hover:text-[#7739DB] transition-colors"><Linkedin size={18} /></Link>
            <Link href="#" className="hover:text-[#7739DB] transition-colors"><Github size={18} /></Link>
            <Link href="#" className="hover:text-[#7739DB] transition-colors"><Mail size={18} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
