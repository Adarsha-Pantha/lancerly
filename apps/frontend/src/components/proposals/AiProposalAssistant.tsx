"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AiProposalAssistantProps = {
  value: string;
  onChange: (value: string) => void;
  projectTitle?: string;
  projectDescription?: string;
  skills?: string[];
  token?: string; // auth token to call the backend
  placeholder?: string;
  error?: string;
  minLength?: number;
  className?: string;
};


export function AiProposalAssistant({
  value,
  onChange,
  projectTitle,
  projectDescription,
  skills,
  token,
  placeholder,
  error,
  minLength: _minLength = 50,
  className,
}: AiProposalAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalValue, setOriginalValue] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!projectTitle) {
      setAiError("Project title is required to generate a proposal.");
      return;
    }

    setAiError(null);
    setOriginalValue(value);
    setIsGenerating(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/proposals/generate-draft`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectTitle,
            projectDescription: projectDescription || "",
            skills: skills || [],
            existingText: value.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      if (!data.draft) throw new Error("Empty response from AI");

      onChange(data.draft);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate proposal";
      setAiError(msg);
      // Restore the original text if generation failed
      onChange(originalValue);
      setOriginalValue("");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDiscard() {
    if (originalValue !== "") {
      onChange(originalValue);
      setOriginalValue("");
      setAiError(null);
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* The editable textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={10}
        disabled={isGenerating}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors",
          "placeholder:text-muted-foreground font-mono leading-relaxed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-70 disabled:cursor-wait",
          error ? "border-destructive" : "border-[#E2E8F0]"
        )}
      />

      {/* Loading overlay */}
      {isGenerating && (
        <div className="absolute inset-0 rounded-xl bg-white/90 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-[#7C3AED]">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin" />
              <Sparkles className="w-3 h-3 absolute -top-0.5 -right-0.5 text-yellow-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Generating your proposal…</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Llama 3.1 is crafting an Introduction, Plan, Timeline &amp; Questions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Error */}
      {aiError && (
        <div className="mt-2 flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">AI generation failed: </span>
            {aiError}
            {aiError.includes("GROQ_API_KEY") && (
              <span className="block mt-0.5 text-amber-600">
                Get a free key at{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  console.groq.com
                </a>
                , then add <code className="bg-amber-100 px-1 rounded">GROQ_API_KEY=gsk_...</code> to your backend <code className="bg-amber-100 px-1 rounded">.env</code>.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border",
            "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 hover:-translate-y-0.5",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          )}
        >
          <Sparkles size={15} className="shrink-0" />
          {isGenerating ? "Generating…" : "Generate with AI"}
          <span className="text-[10px] font-bold text-[#7C3AED]/60 ml-0.5 border border-[#7C3AED]/20 rounded px-1 py-0.5">FREE</span>
        </button>

        {/* Undo — only visible after a successful AI generation */}
        {originalValue !== "" && !isGenerating && !aiError && (
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#F1F5F9] transition-colors border border-transparent hover:border-[#E2E8F0]"
          >
            <RotateCcw size={13} />
            Undo AI draft
          </button>
        )}

        {/* Hint */}
        <span className="text-[11px] text-muted-foreground ml-auto">
          Powered by Llama 3.1 via Groq
        </span>
      </div>
    </div>
  );
}
