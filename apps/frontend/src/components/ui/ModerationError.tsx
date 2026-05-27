"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModerationError({
  message,
  title = "Message blocked",
  description = "This content may violate community guidelines. Please edit and try again.",
  className,
}: {
  message?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  if (!message) return null;
  const desc = message || description;
  return (
    <div className={cn("rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900", className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200">
          <AlertTriangle className="size-4 text-amber-700" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black">{title}</p>
          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

