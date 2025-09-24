import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
};

export default function Button({ children, variant = "primary", href = "#" }: ButtonProps) {
  const base =
    "px-5 py-2 rounded-lg transition font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:ring-indigo-600"
      : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-600";

  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
