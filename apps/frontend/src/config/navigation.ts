/**
 * Navigation config - Work section (sidebar) vs Personal (navbar user menu)
 * Sidebar = work only. Profile/Settings = user dropdown.
 */
import {
  LayoutDashboard,
  BarChart3,
  Folder,
  FileText,
  MessageCircle,
  Send,
  Search,
  Plus,
  Scale,
} from "lucide-react";

export type NavRole = "CLIENT" | "FREELANCER" | "ADMIN";

/** Sidebar: work-related only. No Profile. */
export const SIDEBAR_NAV: { href: string; label: string; icon: React.ElementType; roles?: NavRole[] }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects/mine", label: "My Projects", icon: Folder, roles: ["CLIENT"] },
  { href: "/dashboard/browse", label: "Browse Projects", icon: Search },
  { href: "/dashboard/projects/new", label: "Post Project", icon: Plus, roles: ["CLIENT"] },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/proposals/me", label: "My Proposals", icon: Send, roles: ["FREELANCER"] },
  { href: "/contracts/me", label: "Contracts", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function getPrimaryCta(role: NavRole) {
  return role === "CLIENT"
    ? { href: "/dashboard/projects/new", label: "Post Project", icon: Plus }
    : { href: "/dashboard/browse", label: "Find Work", icon: Search };
}
