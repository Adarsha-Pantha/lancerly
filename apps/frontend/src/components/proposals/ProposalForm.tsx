"use client";

import { useState } from "react";
import { Send, X, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiProposalAssistant } from "./AiProposalAssistant";

type ProposalFormProps = {
  projectTitle?: string;
  projectDescription?: string;
  budgetMin?: number;
  budgetMax?: number;
  onSubmit: (data: { coverLetter: string; proposedBudget: number }) => Promise<void>;
  onCancel: () => void;
};

export function ProposalForm({
  projectTitle,
  projectDescription,
  budgetMin = 0,
  budgetMax = 0,
  onSubmit,
  onCancel,
}: ProposalFormProps) {
  const [bid, setBid] = useState("");
  const [timeline, setTimeline] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const bidNum = Number(bid);

    if (!bid.trim() || isNaN(bidNum) || bidNum < 0) {
      next.bid = "Please enter a valid bid amount";
    } else if (budgetMin != null && bidNum < budgetMin) {
      next.bid = `Bid must be at least $${budgetMin}`;
    } else if (budgetMax != null && budgetMax > 0 && bidNum > budgetMax) {
      next.bid = `Bid cannot exceed $${budgetMax}`;
    }

    if (!timeline.trim()) {
      next.timeline = "Please specify your timeline";
    }

    if (!coverLetter.trim()) {
      next.coverLetter = "Please write a cover letter";
    } else if (coverLetter.length < 50) {
      next.coverLetter = "Cover letter must be at least 50 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      await onSubmit({
        coverLetter: `${coverLetter.trim()}\n\nTimeline: ${timeline.trim()}`,
        proposedBudget: Math.round(Number(bid)),
      });
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        submit: err instanceof Error ? err.message : "Failed to submit proposal",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Submit Your Proposal
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Tell the client why you&apos;re the right fit. A strong proposal increases your chances.
      </p>

      {errors.submit && (
        <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2">
          <AlertCircle size={18} />
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Your bid ($) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="number"
                min={0}
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                placeholder={
                  budgetMin || budgetMax
                    ? `$${budgetMin ?? 0} – $${budgetMax ?? "—"}`
                    : "e.g. 500"
                }
                className={`pl-10 ${errors.bid ? "border-destructive" : ""}`}
              />
            </div>
            {errors.bid && (
              <p className="mt-1 text-sm text-destructive">{errors.bid}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Timeline <span className="text-destructive">*</span>
            </label>
            <Input
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="e.g. 2 weeks, 1 month"
              className={errors.timeline ? "border-destructive" : ""}
            />
            {errors.timeline && (
              <p className="mt-1 text-sm text-destructive">{errors.timeline}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Cover letter <span className="text-destructive">*</span>
          </label>
          <AiProposalAssistant
            value={coverLetter}
            onChange={setCoverLetter}
            projectTitle={projectTitle}
            projectDescription={projectDescription}
            placeholder="Explain why you're the perfect fit, your relevant experience, and how you'll approach this project..."
            error={errors.coverLetter}
            minLength={50}
          />
          {errors.coverLetter && (
            <p className="mt-1 text-sm text-destructive flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.coverLetter}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X size={16} />
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Proposal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
