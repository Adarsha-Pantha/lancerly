"use client";

import { ShieldCheck, ShieldOff, Clock, Lock, FileCheck } from "lucide-react";

type TrustBadgesProps = {
  kycVerified?: boolean;
  doubleBlindReview?: boolean;
  compact?: boolean;
};


export function KYCVerifiedBadge({ kycStatus }: { kycStatus?: string | null }) {
  if (kycStatus === "APPROVED") {
    return (
      <span className="trust-badge flex flex-row items-center gap-2">
        <ShieldCheck size={14} />
        KYC Verified
      </span>
    );
  }
  if (kycStatus === "PENDING") {
    return (
      <span className="flex flex-row items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
        <Clock size={13} />
        Verification Pending
      </span>
    );
  }
  if (kycStatus === "REJECTED") {
    return (
      <span className="flex flex-row items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
        <ShieldOff size={13} />
        Not Verified
      </span>
    );
  }
  // NOT_SUBMITTE
  return (
    <span className="flex flex-row items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
      <ShieldOff size={13} />
      Not Verified
    </span>
  );
}

export function DoubleBlindReviewCard() {
  return (
    <div className="bento-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl shadow-clay-inner flex items-center justify-center shrink-0">
          <Lock size={20} className="text-mint" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-blue text-sm">Double-Blind Review</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Both parties submit reviews before viewing the other&apos;s. Ensures unbiased feedback.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EscrowBadge() {
  return (
    <span className="trust-badge">
      <FileCheck size={14} />
      Escrow Protected
    </span>
  );
}

export default function TrustBadges({ kycVerified, doubleBlindReview, compact }: TrustBadgesProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "space-y-3"}`}>
      {kycVerified !== false && <KYCVerifiedBadge />}
      {doubleBlindReview !== false && compact ? null : <DoubleBlindReviewCard />}
    </div>
  );
}
