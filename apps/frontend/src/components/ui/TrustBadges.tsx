"use client";

import { ShieldCheck, Lock, FileCheck } from "lucide-react";

type TrustBadgesProps = {
  kycVerified?: boolean;
  doubleBlindReview?: boolean;
  compact?: boolean;
};

export function KYCVerifiedBadge() {
  return (
    <span className="trust-badge">
      <ShieldCheck size={14} />
      KYC Verified
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
