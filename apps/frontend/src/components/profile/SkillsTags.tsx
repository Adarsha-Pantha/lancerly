"use client";

import { cn } from "@/lib/utils";

type SkillsTagsProps = {
  skills: string[];
  maxVisible?: number;
  className?: string;
  size?: "sm" | "md";
};

export function SkillsTags({
  skills,
  maxVisible,
  className,
  size = "md",
}: SkillsTagsProps) {
  const displaySkills = maxVisible ? skills.slice(0, maxVisible) : skills;
  const remaining = maxVisible ? skills.length - maxVisible : 0;

  if (skills.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {displaySkills.map((skill, idx) => (
        <span
          key={idx}
          className={cn(
            "inline-flex items-center font-bold rounded-2xl border transition-all duration-200 hover:scale-[1.04] hover:shadow-md cursor-default",
            `skill-pill-${idx % 8}`,
            size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs"
          )}
        >
          {skill}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-2xl bg-secondary text-muted-foreground border border-border">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
