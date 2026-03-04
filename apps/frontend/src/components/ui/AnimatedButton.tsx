"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export default function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]";
  
  const variants = {
    primary: "bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)] hover:bg-[#A78BFA] hover:shadow-[0_4px_12px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98] rounded-xl",
    secondary: "bg-white text-[#2C304B] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:scale-[1.02] active:scale-[0.98] rounded-xl",
    outline: "bg-white border-2 border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#F5F3FF] hover:scale-[1.02] active:scale-[0.98] rounded-xl",
    ghost: "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] rounded-xl active:scale-[0.98]",
    danger: "bg-[#F43F5E] text-white hover:bg-[#F43F5E]/90 shadow-[0_2px_8px_rgba(244,63,94,0.3)] hover:scale-[1.02] active:scale-[0.98] rounded-xl",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

