"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, DollarSign } from "lucide-react";

/**
 * Lightweight estimator (placeholder) to restore build.
 * It provides suggested min/max from text length and selected skills count.
 */
export default function AiBudgetEstimator({
  // Newer usage
  title,
  description,
  skills,
  onPick,
  // Back-compat usage (PostProjectWizard)
  formData,
  onApplyEstimates,
}: {
  title?: string;
  description?: string;
  skills?: string[];
  onPick?: (min: number, max: number) => void;
  formData?: { title: string; description: string; skills: string };
  onApplyEstimates?: (min: string, max: string) => void;
}) {
  const t = formData?.title ?? title ?? "";
  const d = formData?.description ?? description ?? "";
  const skillsArr =
    formData?.skills != null
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : (skills ?? []);

  const suggestion = useMemo(() => {
    const lengthScore = Math.min(6, Math.max(1, Math.floor(d.trim().length / 200)));
    const skillsScore = Math.min(6, Math.max(1, Math.floor((skillsArr?.length || 0) / 3) + 1));
    const score = Math.max(lengthScore, skillsScore);
    const min = score * 100;
    const max = score * 200;
    return { min, max, score };
  }, [d, skillsArr]);

  return (
    <Card className="border-violet-200/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-violet-600" />
          AI budget estimator
        </CardTitle>
        <CardDescription>
          Suggested range based on your brief. (Basic fallback estimator)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-800">Suggested range</p>
            <p className="text-xs font-semibold text-slate-400">score {suggestion.score}/6</p>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
            ${suggestion.min.toLocaleString()} – ${suggestion.max.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tip: add more detail to improve accuracy.
          </p>
        </div>

        {(onPick || onApplyEstimates) && (
          <button
            type="button"
            onClick={() => {
              if (onPick) onPick(suggestion.min, suggestion.max);
              if (onApplyEstimates) onApplyEstimates(String(suggestion.min), String(suggestion.max));
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white hover:bg-violet-700 transition-colors"
          >
            <DollarSign className="size-4" />
            Use this range
          </button>
        )}
      </CardContent>
    </Card>
  );
}

