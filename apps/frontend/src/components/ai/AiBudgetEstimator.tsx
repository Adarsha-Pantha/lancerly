"use client";

import { useState } from "react";
import { Sparkles, Clock, DollarSign, Brain, CheckCircle2, AlertCircle } from "lucide-react";
import { post } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AiBudgetEstimatorProps {
  formData: {
    title: string;
    description: string;
    skills: string;
  };
  onApplyEstimates: (budgetMin: string, budgetMax: string) => void;
}

export default function AiBudgetEstimator({ formData, onApplyEstimates }: AiBudgetEstimatorProps) {
  const { token } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEstimate = async () => {
    if (!formData.title || !formData.description) {
      setError("Please provide a title and description first.");
      return;
    }

    if (!token) {
      setError("You must be logged in to use the AI estimator.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const skills = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      const estimate = await post<any>("/projects/estimate", {
        title: formData.title,
        description: formData.description,
        skills
      }, token);
      setResults(estimate);
    } catch (err) {
      setError("Failed to generate estimate. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mt-8">
      <Card className="overflow-hidden border-purple-100 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] shadow-md transition-all hover:shadow-lg">
        <CardHeader className="relative pb-4">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-400/10 blur-[80px]" />
          <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg">AI Budget & Timeline Estimator</CardTitle>
                <CardDescription className="text-slate-600">
                  Data-driven insights from successful historical projects
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleEstimate}
              disabled={analyzing}
              className="w-full shrink-0 bg-purple-600 font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 active:scale-95 md:w-auto rounded-lg"
            >
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Estimate
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {error && (
            <CardContent className="pb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            </CardContent>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="space-y-6 pt-0">
                <div className="h-px bg-purple-200/50" />
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm transition-all hover:border-purple-200">
                    <div className="mb-2 flex items-center gap-2 text-purple-600">
                      <DollarSign size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Suggested Budget</span>
                    </div>
                    <p className="text-[20px] font-semibold text-slate-900">
                      ${results.suggestedBudget.min} - ${results.suggestedBudget.max}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">MARKET AVERAGE</p>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm transition-all hover:border-purple-200">
                    <div className="mb-2 flex items-center gap-2 text-blue-600">
                      <Clock size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estimated Duration</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {results.suggestedDuration} <span className="text-sm font-medium text-slate-500">Days</span>
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">PREDICTED DELIVERY</p>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm transition-all hover:border-purple-200">
                    <div className="mb-2 flex items-center gap-2 text-emerald-600">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI Confidence</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={results.confidence} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-slate-900">{results.confidence}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">DATA STABILITY</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="mt-1 rounded-full bg-emerald-500 p-1 text-white">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                       <span className="text-sm font-bold text-emerald-900">Historical Match Found</span>
                       <Badge variant="success" className="text-[10px]">{results.complexity} Complexity</Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-800">
                      {results.matchedReason}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-purple-100 bg-purple-50/30 p-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onApplyEstimates(results.suggestedBudget.min.toString(), results.suggestedBudget.max.toString())}
                  className="group h-auto p-0 font-bold text-purple-600 hover:bg-transparent hover:text-purple-700"
                >
                  Apply recommended estimates
                  <Sparkles className="ml-2 h-4 w-4 transition-all group-hover:scale-125" />
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
