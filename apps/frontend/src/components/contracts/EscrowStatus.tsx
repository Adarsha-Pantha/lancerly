"use client";

import { User, Lock, Wallet, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "client" | "escrow" | "freelancer";

type EscrowStatusProps = {
  stage: Stage;
  amount?: number;
  fundedCount?: number;
  totalMilestones?: number;
  className?: string;
};

const STAGES: { key: Stage; icon: typeof User; label: string; desc: string }[] = [
  { key: "client", icon: User, label: "Client", desc: "You fund milestones" },
  { key: "escrow", icon: Lock, label: "Escrow", desc: "Held securely until work is approved" },
  { key: "freelancer", icon: Wallet, label: "Freelancer", desc: "Released after approval" },
];

export function EscrowStatus({
  stage,
  amount,
  fundedCount = 0,
  totalMilestones = 0,
  className,
}: EscrowStatusProps) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-[#059669]" />
        <h3 className="text-sm font-semibold text-foreground">
          Payment protection
          {amount != null && amount > 0 && (
            <span className="font-normal text-muted-foreground ml-1">
              – ${amount.toLocaleString()} total
            </span>
          )}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isActive ? "bg-[#059669] text-white" : "bg-[#F1F5F9] text-[#94A3B8]",
                    isCurrent && "ring-2 ring-[#059669] ring-offset-2"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium mt-1.5",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-1 rounded-full transition-colors",
                    i < currentIdx ? "bg-[#059669]" : "bg-[#E2E8F0]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {totalMilestones > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          {fundedCount} of {totalMilestones} milestone{totalMilestones === 1 ? "" : "s"} funded
        </p>
      )}
    </div>
  );
}
