"use client";

import { User, Lock, Wallet } from "lucide-react";

type MilestoneTrackerProps = {
  stage: "client" | "escrow" | "freelancer";
  amount?: number;
  label?: string;
};

export default function MilestoneTracker({
  stage,
  amount,
  label = "Milestone payment",
}: MilestoneTrackerProps) {
  const stages: { key: "client" | "escrow" | "freelancer"; icon: typeof User; label: string; desc: string }[] = [
    { key: "client" as const, icon: User, label: "Client", desc: "Funds from client" },
    { key: "escrow" as const, icon: Lock, label: "Escrow", desc: "Held securely" },
    { key: "freelancer" as const, icon: Wallet, label: "Freelancer", desc: "Released on approval" },
  ];

  const currentIdx = stages.findIndex((s) => s.key === stage);

  return (
    <div className="bento-card p-5">
      <h3 className="text-sm font-semibold text-slate-blue mb-4">
        Payment flow {amount ? `– $${amount.toLocaleString()}` : ""}
      </h3>
      <div className="flex items-center gap-2">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? "bg-mint text-white" : "bg-slate-100 text-slate-400"
                  } ${isCurrent ? "ring-2 ring-mint ring-offset-2" : ""}`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-medium mt-1 ${isActive ? "text-slate-blue" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                    i < currentIdx ? "bg-mint" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3">{label}</p>
    </div>
  );
}
