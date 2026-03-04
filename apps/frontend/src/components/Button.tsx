import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  className?: string;
};

export default function Button({ children, variant = "primary", href = "#", className = "" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-[12px] text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:bg-accent-hover hover:shadow-[0_4px_12px_rgba(124,58,237,0.4)] active:scale-[0.98]"
      : variant === "secondary"
        ? "border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]";

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}
