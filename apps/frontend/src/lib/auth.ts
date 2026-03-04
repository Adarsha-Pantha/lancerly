// apps/frontend/src/lib/auth.ts
import type { User } from "@/context/AuthContext";

export const needsCompletion = (u?: User | null) =>
  !u?.name || !u?.country || !u?.phone || !u?.street || !u?.city || !u?.state || !u?.postalCode;

export const needsRoleSelection = (u?: User | null) =>
  !u?.role || (u.role !== "CLIENT" && u.role !== "FREELANCER");
