"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, Rss, UserCircle2, Settings, Sparkles } from "lucide-react";

export function FeedSidebar({
  userName,
  userRole,
  userAvatarUrl,
  fallbackAvatar,
  postCount,
  onOpenProfile,
  className,
}: {
  userName?: string | null;
  userRole?: string | null;
  userAvatarUrl?: string | null;
  fallbackAvatar: string;
  postCount?: number;
  onOpenProfile?: () => void;
  className?: string;
}) {
  const safeName = userName || "Member";
  return (
    <aside className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400" />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <img
              src={userAvatarUrl || fallbackAvatar}
              alt={safeName}
              className="size-11 rounded-2xl object-cover border border-slate-200"
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{safeName}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                {userRole ? userRole.toLowerCase() : "member"}
                {typeof postCount === "number" ? ` • ${postCount} posts` : ""}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/home"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={onOpenProfile}
              className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors"
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      <nav className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-2">
          {[
            { href: "/feed", label: "Feed", icon: Rss },
            { href: "/home", label: "Browse", icon: Home },
            { href: "/profile", label: "My profile", icon: UserCircle2 },
            { href: "/settings", label: "Settings", icon: Settings },
          ].map((i) => {
            const Icon = i.icon;
            return (
              <Link
                key={i.href}
                href={i.href}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex size-8 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Icon className="size-4" />
                </span>
                {i.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-50 via-white to-amber-50 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-600" />
          <p className="text-sm font-black text-slate-900">Tip</p>
        </div>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Share progress updates with a short summary + 1 image. Posts with visuals get more engagement.
        </p>
      </div>
    </aside>
  );
}

