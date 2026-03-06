"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AiProposalAssistantProps = {
  value: string;
  onChange: (value: string) => void;
  projectTitle?: string;
  projectDescription?: string;
  placeholder?: string;
  error?: string;
  minLength?: number;
  className?: string;
};

// minLength is for future validation; currently unused in generate button

/**
 * AI Proposal Assistant – helps freelancers write stronger cover letters.
 * Shows loading state when generating, allows edit/discard.
 */
export function AiProposalAssistant({
  value,
  onChange,
  projectTitle,
  projectDescription,
  placeholder,
  error,
  minLength: _minLength = 50,
  className,
}: AiProposalAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalValue, setOriginalValue] = useState("");

  async function handleGenerate() {
    setOriginalValue(value);
    setIsGenerating(true);

    // Simulate AI delay (no backend yet – replace with API when available)
    await new Promise((r) => setTimeout(r, 2000));

    const generated = generateProposalDraft({
      existing: value,
      projectTitle: projectTitle ?? "this project",
      projectDescription: projectDescription ?? "",
    });
    onChange(generated);
    setIsGenerating(false);
  }

  function handleDiscard() {
    if (originalValue !== undefined) {
      onChange(originalValue);
      setOriginalValue("");
    }
  }

  return (
    <div className={cn("relative", className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        disabled={isGenerating}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-70 disabled:cursor-wait",
          error ? "border-destructive" : "border-[#E2E8F0]",
          isGenerating && "animate-pulse"
        )}
      />
      {isGenerating && (
        <div className="absolute inset-0 rounded-xl bg-white/80 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-medium">Writing your proposal...</span>
            <span className="text-xs text-muted-foreground">AI is crafting a personalized cover letter</span>
          </div>
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            "bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7C3AED]/10"
          )}
        >
          <Sparkles size={16} className="shrink-0" />
          Generate with AI
        </button>
        {originalValue !== "" && !isGenerating && (
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#F1F5F9] transition-colors"
          >
            <RotateCcw size={14} />
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

type GenerateInput = {
  existing: string;
  projectTitle: string;
  projectDescription: string;
};

function generateProposalDraft(input: GenerateInput): string {
  const { existing, projectTitle } = input;

  if (existing.trim().length > 100) {
    // User already wrote something substantial – enhance it
    return `${existing.trim()}\n\nI'm confident I can deliver high-quality work on schedule and would welcome the opportunity to discuss the project further.`;
  }

  // Generate a template draft
  return `I'm excited to apply for "${projectTitle}". 

I have relevant experience and the skills needed to deliver this project successfully. I'm detail-oriented, communicate clearly, and committed to meeting deadlines.

I'd love to discuss your requirements in more detail and answer any questions you might have. Looking forward to the opportunity to work with you.`;
}
