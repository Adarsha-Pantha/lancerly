"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { post } from "@/lib/api";
import { Crown, CheckCircle2, Zap, ArrowRight, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE ?? "$9.99";
const PRO_BILLING = process.env.NEXT_PUBLIC_PRO_BILLING ?? "/ month";

export function SubscriptionSection() {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setSyncing(true);
      post("/stripe/sync-subscription", {}, token ?? undefined)
        .catch(() => null)
        .finally(() => {
          window.location.href = "/settings?tab=subscription";
        });
    }
  }, [token]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { url } = await post<{ url: string }>("/stripe/create-subscription-session", {}, token ?? undefined);
      if (url) window.location.href = url;
    } catch (e) {
      console.error("Subscription error", e);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      await post("/stripe/subscribe", { subscribe: false }, token ?? undefined);
      setCancelled(true);
      if (refreshUser) await refreshUser();
    } catch (e) {
      console.error("Cancel error", e);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = user?.isSubscribed ?? false;

  if (syncing) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-violet-600" />
          <p className="text-sm font-bold text-slate-600">Activating your subscription…</p>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 mx-auto">
          <XCircle className="size-6 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-900">Subscription cancelled</p>
        <p className="text-sm text-slate-500">You'll keep Pro access until the end of your current billing period.</p>
        <button
          onClick={() => setCancelled(false)}
          className="text-xs font-bold text-violet-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Current plan card */}
      <div className={cn(
        "rounded-2xl border p-6",
        isSubscribed
          ? "border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50"
          : "border-slate-200 bg-white"
      )}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-12 items-center justify-center rounded-2xl",
              isSubscribed ? "bg-violet-600" : "bg-slate-100"
            )}>
              <Crown className={cn("size-6", isSubscribed ? "text-white" : "text-slate-400")} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">
                {isSubscribed ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-sm text-slate-500">
                {isSubscribed ? "All features unlocked" : "Limited to 3 projects / week"}
              </p>
            </div>
          </div>
          {isSubscribed && (
            <span className="flex items-center gap-1.5 rounded-2xl bg-emerald-100 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="size-3.5" />
              Active
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Unlimited project postings", pro: true },
            { label: "AI Brief Refiner", pro: true },
            { label: "AI Budget Estimation", pro: false },
            { label: "Smart Freelancer Matching", pro: true },
            { label: "Priority support", pro: true },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 text-sm">
              <CheckCircle2 className={cn(
                "size-4 shrink-0",
                !f.pro || isSubscribed ? "text-emerald-500" : "text-slate-300"
              )} />
              <span className={cn(
                "font-medium",
                !f.pro || isSubscribed ? "text-slate-700" : "text-slate-400"
              )}>
                {f.label}
                {f.pro && !isSubscribed && (
                  <span className="ml-1.5 text-[10px] font-semibold text-violet-500 uppercase tracking-wider">PRO</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action area */}
      {!isSubscribed ? (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <Zap className="size-5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-violet-900 text-sm">Upgrade to Pro</p>
                <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
                  Post unlimited projects and unlock all AI-powered features. Cancel anytime.
                </p>
              </div>
            </div>
            {/* Price display */}
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-violet-900">{PRO_PRICE}</p>
              <p className="text-xs text-violet-600 font-semibold">{PRO_BILLING}</p>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-2xl transition-colors shadow-[0_4px_14px_-4px_rgba(109,40,217,0.5)] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirecting to checkout…
              </>
            ) : (
              <>
                <Crown className="size-4" />
                Subscribe — {PRO_PRICE}{PRO_BILLING}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
          <p className="text-[11px] text-violet-600/70 mt-3">
            Billed monthly. Cancel anytime from this page.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Cancel subscription</p>
            <p className="text-xs text-slate-500 mt-0.5">
              You'll keep Pro access until the end of your billing period.
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 text-sm font-bold rounded-2xl hover:bg-rose-50 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Cancel Plan"}
          </button>
        </div>
      )}
    </div>
  );
}
