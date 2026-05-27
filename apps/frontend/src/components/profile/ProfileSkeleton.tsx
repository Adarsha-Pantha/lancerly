"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_32px_80px_-20px_rgba(91,33,182,0.35)]">
      {/* Banner */}
      <Skeleton className="h-[11rem] sm:h-[13rem] w-full rounded-none bg-gradient-to-br from-violet-400/50 via-fuchsia-400/40 to-pink-300/40" />
      {/* Below-banner */}
      <div className="bg-white/95 px-6 pb-7 pt-0 -mt-[4.5rem] sm:-mt-[5rem]">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar placeholder */}
          <div className="relative shrink-0">
            <div className="h-[8.5rem] w-[8.5rem] sm:h-[9.5rem] sm:w-[9.5rem] rounded-[1.6rem] bg-gradient-to-br from-violet-300/50 to-fuchsia-200/40 animate-pulse shadow-lg" />
          </div>
          {/* Meta */}
          <div className="flex-1 space-y-3 pb-2 pt-1 sm:pt-0">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-36 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="profile-card">
      <div className="profile-card-stripe bg-gradient-to-b from-violet-300 to-fuchsia-300 animate-pulse" />
      <div className="profile-card-inner space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <Skeleton className="h-5 w-40 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-5/6 rounded-xl" />
        <Skeleton className="h-4 w-4/5 rounded-xl" />
      </div>
    </div>
  );
}
