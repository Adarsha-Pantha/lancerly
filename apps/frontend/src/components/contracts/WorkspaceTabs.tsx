"use client";

import { MessageCircle, ListChecks, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "overview" | "milestones" | "chat";

type WorkspaceTabsProps = {
  active: WorkspaceTab;
  onSelect: (tab: WorkspaceTab) => void;
  className?: string;
};

const TABS: { id: WorkspaceTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "milestones", label: "Milestones", icon: ListChecks },
  { id: "chat", label: "Messages", icon: MessageCircle },
];

export function WorkspaceTabs({ active, onSelect, className }: WorkspaceTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]",
        className
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            <Icon size={18} className="shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
