"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AiBriefRefinerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minLength?: number;
  className?: string;
};

/**
 * AI Brief Refiner – helps clients improve their project description.
 * Shows shimmer when "generating", allows edit/discard of AI suggestions.
 */
export function AiBriefRefiner({
  value,
  onChange,
  placeholder,
  error,
  minLength = 10,
  className,
}: AiBriefRefinerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalValue, setOriginalValue] = useState("");

  async function handleImprove() {
    if (!value.trim()) return;
    setOriginalValue(value);
    setIsGenerating(true);

    // Simulate AI delay (no backend yet – replace with API call when available)
    await new Promise((r) => setTimeout(r, 1500));

    // Simple enhancement: add structure and expand (mock)
    const enhanced = enhanceBrief(value);
    onChange(enhanced);
    setIsGenerating(false);
  }

  function handleDiscard() {
    if (originalValue) {
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
        rows={5}
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
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Improving your description...</span>
          </div>
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleImprove}
          disabled={!value.trim() || value.trim().length < minLength || isGenerating}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            "bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7C3AED]/10"
          )}
        >
          <Sparkles size={16} className="shrink-0" />
          Improve with AI
        </button>
        {originalValue && !isGenerating && (
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

/**
 * Mock enhancement – adds structure and clarity.
 * Replace with real API call when backend is ready.
 */
function enhanceBrief(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  // Simple enhancement: ensure it has some structure
  const lines = trimmed.split(/\n+/).filter(Boolean);
  if (lines.length >= 2) return trimmed;

  // If it's one block, try to add bullet points for clarity
  const words = trimmed.split(/\s+/);
  if (words.length < 20) return trimmed;

  // Add a brief intro and structure
  const firstSentence = trimmed.match(/^[^.!?]+[.!?]/)?.[0] ?? trimmed.slice(0, 80) + "...";
  const rest = trimmed.slice(firstSentence.length).trim();
  if (!rest) return trimmed;

  const bullets = rest
    .split(/[.;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 4);

  if (bullets.length === 0) return trimmed;

  return [firstSentence, "", "Key requirements:", ...bullets.map((b) => `• ${b}`)].join("\n");
}
