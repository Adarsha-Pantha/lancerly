"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, ArrowRight, Copy, Loader2 } from "lucide-react";

export default function BriefRefinerPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [refinedOutput, setRefinedOutput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token || !user) {
    router.replace("/login?redirect=/ai/brief-refiner");
    return null;
  }

  const handleRefine = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    setRefinedOutput("");
    // Simulate AI refinement (replace with actual API call)
    await new Promise((r) => setTimeout(r, 1500));
    setRefinedOutput(
      `**Project Summary**\n${rawInput}\n\n**Structured Requirements**\n1. Clear deliverables identified\n2. Suggested acceptance criteria added\n3. Screening questions: "Can you provide examples of similar work?" "What is your timeline?"\n\n**AI-Enhanced Notes**\n• Scope clarified\n• Budget and timeline recommendations included`
    );
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refinedOutput);
  };

  return (
    <div className="min-h-screen bg-bg-neutral p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-purple">Project Brief Refiner</h1>
            <p className="text-slate-500 mt-1">
              AI-powered refinement of your project description
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-mint hover:text-mint-dark transition-colors"
          >
            Use in New Project <ArrowRight size={16} />
          </Link>
        </div>

        {/* Split-Screen AI Workspace */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left – Raw input */}
          <div className="bento-card p-5">
            <label className="block text-sm font-semibold text-brand-purple mb-3">
              Raw Project Brief
            </label>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste or type your project description here. Be as detailed or rough as you like – AI will help structure it."
              className="w-full h-80 px-4 py-3 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint/40 focus:border-mint resize-none"
              disabled={loading}
            />
            <button
              onClick={handleRefine}
              disabled={loading || !rawInput.trim()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-mint text-white font-semibold rounded-lg hover:bg-mint-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Refine with AI
                </>
              )}
            </button>
          </div>

          {/* Right – AI-enhanced output (glowing container) */}
          <div className="bento-card p-5 ai-glow border-mint/30 border relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-mint/10 px-3 py-1 rounded-bl-lg">
              <span className="flex items-center gap-1 text-xs font-semibold text-mint">
                <Sparkles size={12} />
                AI Enhanced
              </span>
            </div>
            <label className="block text-sm font-semibold text-brand-purple mb-3">
              AI-Refined Output
            </label>
            <div className="h-80 overflow-y-auto rounded-lg bg-slate-50/80 border border-slate-100 px-4 py-3">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {refinedOutput || (
                  <span className="text-slate-400">
                    Refined output will appear here after you refine your brief.
                  </span>
                )}
              </pre>
            </div>
            {refinedOutput && (
              <button
                onClick={handleCopy}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Copy size={16} />
                Copy to clipboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
