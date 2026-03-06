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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displaySkills.map((skill, idx) => (
        <span
          key={idx}
          className={cn(
            "inline-flex items-center rounded-lg font-medium transition-colors",
            size === "sm"
              ? "px-2.5 py-1 text-xs bg-primary/10 text-primary"
              : "px-3 py-1.5 text-sm bg-primary/10 text-primary"
          )}
        >
          {skill}
        </span>
      ))}
      {remaining > 0 && (
        <span className="px-3 py-1.5 text-sm text-muted-foreground">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
