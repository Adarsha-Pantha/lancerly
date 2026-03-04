"use client";

import { ReactNode } from "react";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs";

type WorkspaceLayoutProps = {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  children: ReactNode;
  className?: string;
};

export function WorkspaceLayout({
  activeTab,
  onTabChange,
  children,
  className,
}: WorkspaceLayoutProps) {
  return (
    <div className={className}>
      <WorkspaceTabs active={activeTab} onSelect={onTabChange} className="mb-6" />
      <div className="min-h-[320px]">{children}</div>
    </div>
  );
}
