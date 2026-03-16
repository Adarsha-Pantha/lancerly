"use client";

import { DollarSign, Calendar, CreditCard, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Milestone = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  dueDate?: string | null;
  status: string;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  isFunded?: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Awaiting payment", className: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "In progress", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Awaiting approval", className: "bg-purple-100 text-purple-800" },
  APPROVED: { label: "Approved", className: "bg-[#059669]/10 text-[#059669]" },
  PAID: { label: "Paid", className: "bg-[#059669]/10 text-[#059669]" },
};

type MilestoneCardProps = {
  milestone: Milestone;
  isClient: boolean;
  onApprove?: () => void;
  onFund?: () => void;
  onComplete?: () => void;
  funding?: boolean;
  platformSettings?: { freelancerServiceFee: number; clientProcessingFee: number } | null;
};

export function MilestoneCard({
  milestone,
  isClient,
  onApprove,
  onFund,
  onComplete,
  funding = false,
  platformSettings,
}: MilestoneCardProps) {
  const config = STATUS_CONFIG[milestone.status] ?? {
    label: milestone.status,
    className: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{milestone.title}</h3>
          {milestone.description && (
            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <DollarSign size={16} />
              <span className="font-medium text-foreground">${(milestone.amount / 100).toLocaleString()}</span>
            </span>
            {isClient && platformSettings && (
              <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                + ${(milestone.amount * platformSettings.clientProcessingFee / 10000).toFixed(2)} processing fee
              </span>
            )}
            {!isClient && platformSettings && milestone.status !== "PAID" && (
              <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                - ${(milestone.amount * platformSettings.freelancerServiceFee / 10000).toFixed(2)} service fee
              </span>
            )}
            {milestone.dueDate && (
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0",
            config.className
          )}
        >
          {config.label === "Paid" && <CheckCircle2 size={14} />}
          {config.label === "Approved" && <CheckCircle2 size={14} />}
          {config.label}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center gap-3">
        {/* Funded badge for clarity */}
        {milestone.isFunded && milestone.status !== "PAID" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <DollarSign size={12} className="fill-emerald-700/20" />
            Money in Escrow
          </div>
        )}

        {isClient && (milestone.status === "COMPLETED") && !milestone.isFunded && onFund && (
          <Button
            size="sm"
            onClick={onFund}
            disabled={funding}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {funding ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                {milestone.stripePaymentIntentId ? "Resume payment" : "Pay & release funds"}
              </>
            )}
          </Button>
        )}

        {isClient && (milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && !milestone.isFunded && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm border border-amber-100 italic">
            <Clock size={14} />
            <span>Freelancer needs to complete this first</span>
          </div>
        )}

        {isClient && milestone.status === "COMPLETED" && milestone.isFunded && onApprove && (
          <Button size="sm" onClick={onApprove} className="gap-2 bg-[#059669] hover:bg-[#047857] shadow-sm">
            <CheckCircle2 size={16} />
            Approve & Release Payment
          </Button>
        )}
        
        {!isClient && onComplete && (milestone.status === "PENDING" || milestone.status === "IN_PROGRESS") && (
          <Button size="sm" variant="default" onClick={onComplete} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <CheckCircle2 size={16} />
            Mark as Complete
          </Button>
        )}

        {!isClient && milestone.status === "COMPLETED" && (
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg text-sm border border-indigo-100 italic">
            <Clock size={14} />
            <span>{milestone.isFunded ? "Money in Escrow - Awaiting client approval" : "Awaiting client payment"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
