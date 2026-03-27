import Link from "next/link";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";

const BRAND = "#7739DB";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 text-slate-500">
      <div className="max-w-6xl mx-auto px-6">
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
              The professional marketplace where quality talent meets world-class projects.
            </p>
          </div>

          {/* Links sections */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/home" className="hover:text-[#7739DB] transition-colors">Browse Projects</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#7739DB] transition-colors">Dashboard</Link></li>
              <li><Link href="/messages" className="hover:text-[#7739DB] transition-colors">Messages</Link></li>
              <li><Link href="/contracts/me" className="hover:text-[#7739DB] transition-colors">My Contracts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-[#7739DB] transition-colors">Help Center</Link></li>
              <li><Link href="/blog" className="hover:text-[#7739DB] transition-colors">Success Stories</Link></li>
              <li><Link href="/guides" className="hover:text-[#7739DB] transition-colors">Freelancing Guides</Link></li>
              <li><Link href="/support" className="hover:text-[#7739DB] transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-[#7739DB] transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-[#7739DB] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#7739DB] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-[#7739DB] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Lancerly. All rights reserved. Built with precision for the future of work.
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
