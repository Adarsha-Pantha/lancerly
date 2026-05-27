"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { post } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Loader2,
  Check,
  HelpCircle,
  ListTodo,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RefinementResult = {
  refinedDescription: string;
  screeningQuestions: string[];
  acceptanceCriteria: string[];
};

export default function BriefRefinerPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [result, setResult] = useState<RefinementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token || !user) router.replace("/login?redirect=/ai/brief-refiner");
  }, [token, user, router]);

  if (!token || !user) return null;

  const canRefine = title.trim().length >= 3 && rawInput.trim().length >= 10;

  const handleRefine = async () => {
    if (!canRefine) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await post<RefinementResult>(
        "/ai/refine-brief",
        { title: title.trim(), description: rawInput.trim() },
        token
      );
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Failed to refine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      `# ${title}`,
      "",
      result.refinedDescription,
      "",
      "## Screening Questions",
      ...result.screeningQuestions.map((q, i) => `${i + 1}. ${q}`),
      "",
      "## Acceptance Criteria",
      ...result.acceptanceCriteria.map((c) => `- ${c}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-8 items-center justify-center rounded-xl bg-violet-100">
                <Sparkles className="size-4 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">AI Brief Refiner</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10">
              Turn a rough description into a professional project brief with screening questions and acceptance criteria.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-violet-700 hover:text-violet-900 transition-colors"
          >
            Use in New Project <ArrowRight size={16} />
          </Link>
        </div>

        {/* Input area */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Input */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400" />
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a SaaS landing page"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Raw Brief <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste your rough project description here. Be as detailed or rough as you like — AI will structure and improve it."
                  rows={9}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 resize-none disabled:opacity-60"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{rawInput.length} characters</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefine}
                  disabled={loading || !canRefine}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_14px_-4px_rgba(109,40,217,0.5)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Refining…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Refine with AI
                    </>
                  )}
                </button>

                {result && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </button>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right — Output */}
          <div
            className={cn(
              "rounded-2xl border shadow-sm overflow-hidden transition-all",
              result
                ? "bg-white border-violet-200"
                : "bg-slate-50 border-slate-200"
            )}
          >
            <div
              className={cn(
                "h-1",
                result
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "bg-slate-200"
              )}
            />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className={cn("size-4", result ? "text-violet-600" : "text-slate-300")} />
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    AI-Refined Output
                  </p>
                </div>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="size-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy all
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="size-8 animate-spin text-violet-600" />
                  <p className="text-sm font-bold text-slate-600">AI is crafting your brief…</p>
                  <p className="text-xs text-slate-400">This takes a few seconds</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Sparkles className="size-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">
                    Your refined brief will appear here
                  </p>
                  <p className="text-xs text-slate-300 max-w-[200px]">
                    Add a title and description, then click "Refine with AI"
                  </p>
                </div>
              )}

              {/* Result */}
              {!loading && result && (
                <div className="space-y-5 overflow-y-auto max-h-[520px] pr-1">
                  {/* Refined description */}
                  <div>
                    <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-2">
                      Refined Description
                    </p>
                    <div className="rounded-xl bg-violet-50/60 border border-violet-100 px-4 py-3">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {result.refinedDescription}
                      </p>
                    </div>
                  </div>

                  {/* Screening questions */}
                  {result.screeningQuestions?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <HelpCircle className="size-3.5 text-indigo-500" />
                        <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                          Screening Questions
                        </p>
                      </div>
                      <div className="space-y-2">
                        {result.screeningQuestions.map((q, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl bg-indigo-50/60 border border-indigo-100 px-4 py-2.5"
                          >
                            <span className="text-[10px] font-semibold text-indigo-400 mt-0.5 shrink-0">
                              0{i + 1}
                            </span>
                            <p className="text-sm text-indigo-900 font-medium leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acceptance criteria */}
                  {result.acceptanceCriteria?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ListTodo className="size-3.5 text-emerald-600" />
                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                          Acceptance Criteria
                        </p>
                      </div>
                      <div className="space-y-2">
                        {result.acceptanceCriteria.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-2.5"
                          >
                            <Check className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Use in project CTA */}
                  <Link
                    href="/dashboard/projects/new"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors mt-2"
                  >
                    Use in New Project
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
