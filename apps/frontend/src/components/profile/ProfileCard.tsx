"use client";

import { cn } from "@/lib/utils";

type ProfileCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** @deprecated use accent */
  variant?: "default" | "violet" | "warm";
  accent?: "violet" | "warm" | "sky" | "emerald" | "rose";
};

const stripeColor: Record<string, string> = {
  violet:  "bg-gradient-to-b from-violet-500 to-fuchsia-500",
  warm:    "bg-gradient-to-b from-amber-500 to-orange-500",
  sky:     "bg-gradient-to-b from-sky-500 to-blue-600",
  emerald: "bg-gradient-to-b from-emerald-500 to-teal-600",
  rose:    "bg-gradient-to-b from-rose-500 to-pink-600",
};

const iconBg: Record<string, string> = {
  violet:  "bg-violet-50 border-violet-200/60 text-violet-700",
  warm:    "bg-amber-50 border-amber-200/60 text-amber-700",
  sky:     "bg-sky-50 border-sky-200/60 text-sky-700",
  emerald: "bg-emerald-50 border-emerald-200/60 text-emerald-700",
  rose:    "bg-rose-50 border-rose-200/60 text-rose-700",
};

export function ProfileCard({
  children,
  className,
  title,
  icon,
  action,
  variant,
  accent,
}: ProfileCardProps) {
  const resolvedAccent = accent ?? (variant === "warm" ? "warm" : variant === "violet" ? "violet" : "violet");

  return (
    <div className={cn("profile-card", className)}>
      {/* Left accent stripe */}
      <div className={cn("profile-card-stripe", stripeColor[resolvedAccent])} />

      <div className="profile-card-inner">
        {(title || action) && (
          <div className="flex items-center justify-between gap-3 mb-6">
            {title && (
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <span className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-2xl border [&>svg]:size-5 shadow-sm",
                    iconBg[resolvedAccent]
                  )}>
                    {icon}
                  </span>
                )}
                <h2 className="text-lg font-semibold font-display text-foreground tracking-tight">{title}</h2>
              </div>
            )}
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
