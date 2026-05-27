"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { post } from "@/lib/api";
import { Sparkles, DollarSign, Clock, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type EstimateResult = {
  suggestedBudget: { min: number; max: number };
  suggestedDuration: number;
  confidence: number;
  matchedReason: string;
  complexity: string;
};

export default function AiBudgetEstimator({
  title,
  description,
  skills,
  onPick,
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
  const { token } = useAuth();
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = formData?.title ?? title ?? "";
  const d = formData?.description ?? description ?? "";
  const skillsArr = formData?.skills
    ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : (skills ?? []);

  const canEstimate = t.trim().length >= 3 && d.trim().length >= 10;

  const fetchEstimate = async () => {
    if (!canEstimate || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await post<EstimateResult>(
        "/projects/estimate",
        { title: t, description: d, skills: skillsArr },
        token
      );
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Failed to get estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if there is enough data
  useEffect(() => {
    if (canEstimate && !result && !loading) {
      fetchEstimate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complexityColor: Record<string, string> = {
    Low: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Medium: "text-amber-700 bg-amber-50 border-amber-200",
    High: "text-orange-700 bg-orange-50 border-orange-200",
    Enterprise: "text-rose-700 bg-rose-50 border-rose-200",
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600" />
            <p className="text-sm font-semibold text-slate-900">AI Budget Estimator</p>
          </div>
          {result && !loading && (
            <button
              type="button"
              onClick={fetchEstimate}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-600 transition-colors"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          )}
        </div>

        {/* No data yet */}
        {!canEstimate && (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
            <p className="text-xs text-slate-400">
              Add a project title and description to get an AI-powered budget estimate.
            </p>
          </div>
        )}

        {/* Loading */}
        {canEstimate && loading && (
          <div className="flex items-center justify-center gap-3 py-6">
            <Loader2 className="size-5 animate-spin text-violet-600" />
            <p className="text-sm font-medium text-slate-600">Analyzing your project…</p>
          </div>
        )}

        {/* Error */}
        {canEstimate && !loading && error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center space-y-2">
            <p className="text-xs text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchEstimate}
              className="text-xs font-bold text-violet-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result */}
        {canEstimate && !loading && result && (
          <div className="space-y-3">
            {/* Budget range */}
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
                  Suggested Budget
                </p>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                    complexityColor[result.complexity] ?? "text-slate-600 bg-slate-50 border-slate-200"
                  )}
                >
                  {result.complexity} complexity
                </span>
              </div>
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                ${result.suggestedBudget.min.toLocaleString()} –{" "}
                ${result.suggestedBudget.max.toLocaleString()}
              </p>
            </div>

            {/* Duration + Confidence */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center gap-2">
                <Clock className="size-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Timeline
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {result.suggestedDuration} days
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Confidence
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{result.confidence}%</p>
                </div>
              </div>
            </div>

            {/* AI reasoning */}
            <p className="text-xs text-slate-500 leading-relaxed">
              {result.matchedReason}
            </p>

            {/* Apply button */}
            {(onPick || onApplyEstimates) && (
              <button
                type="button"
                onClick={() => {
                  if (onPick) onPick(result.suggestedBudget.min, result.suggestedBudget.max);
                  if (onApplyEstimates)
                    onApplyEstimates(
                      String(result.suggestedBudget.min),
                      String(result.suggestedBudget.max)
                    );
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors"
              >
                <DollarSign className="size-4" />
                Use this range
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
