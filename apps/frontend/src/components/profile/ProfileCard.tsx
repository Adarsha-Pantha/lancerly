"use client";

import { cn } from "@/lib/utils";

type ProfileCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function ProfileCard({
  children,
  className,
  title,
  icon,
  action,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div className="flex items-center gap-2">
              {icon && (
                <span className="text-muted-foreground [&>svg]:size-5">
                  {icon}
                </span>
              )}
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
