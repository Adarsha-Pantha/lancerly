import { useState } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { post } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type RefinementResponse = {
  refinedDescription: string;
  screeningQuestions: string[];
  acceptanceCriteria: string[];
};

type AiBriefRefinerProps = {
  value: string;
  onChange: (value: string) => void;
  projectTitle: string;
  onRefined?: (data: RefinementResponse) => void;
  placeholder?: string;
  error?: string;
  minLength?: number;
  className?: string;
};

/**
 * AI Brief Refiner – helps clients improve their project description.
 * Calls backend Groq API to get a professional description, questions, and criteria.
 */
export function AiBriefRefiner({
  value,
  onChange,
  projectTitle,
  onRefined,
  placeholder,
  error,
  minLength = 10,
  className,
}: AiBriefRefinerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalValue, setOriginalValue] = useState("");
  const { token } = useAuth();

  async function handleImprove() {
    if (!value.trim() || !projectTitle.trim()) return;
    setOriginalValue(value);
    setIsGenerating(true);

    try {
      const result = await post<RefinementResponse>(
        "/ai/refine-brief",
        { title: projectTitle, description: value },
        token ?? undefined
      );

      if (result) {
        onChange(result.refinedDescription);
        if (onRefined) {
          onRefined(result);
        }
      }
    } catch (err) {
      console.error("Failed to refine brief:", err);
    } finally {
      setIsGenerating(false);
    }
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
        rows={6}
        disabled={isGenerating}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors",
          "placeholder:text-muted-foreground bg-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500",
          "disabled:opacity-70 disabled:cursor-wait",
          error ? "border-destructive" : "border-slate-200",
          isGenerating && "animate-pulse"
        )}
      />
      {isGenerating && (
        <div className="absolute inset-0 rounded-xl bg-white/80 flex flex-col items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-sm font-semibold text-indigo-900 tracking-tight">AI is crafting your project brief...</span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImprove}
            disabled={!value.trim() || !projectTitle.trim() || value.trim().length < minLength || isGenerating}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm",
              "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 hover:shadow-md active:scale-95",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:shadow-none"
            )}
          >
            <Sparkles size={16} className="shrink-0" />
            Improve with AI
          </button>
          {originalValue && !isGenerating && (
            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors border border-transparent"
            >
              <RotateCcw size={14} />
              Undo Changes
            </button>
          )}
        </div>
        {!isGenerating && value.length > 0 && (
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            {value.length} characters
          </span>
        )}
      </div>
    </div>
  );
}
