'use client';

import { Suspense } from 'react';
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const milestoneId = searchParams.get('milestoneId');
  const paymentIntent = searchParams.get('payment_intent');
  const contractId = searchParams.get('contractId');
  const amountCents = searchParams.get('amount');
  const milestoneTitle = searchParams.get('title');

  const amountFormatted = amountCents
    ? (parseInt(amountCents) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : null;

  useEffect(() => {
    if (paymentIntent) {
      toast.toast('Payment processed successfully!', 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Main success card */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Payment Successful!</h1>

            {milestoneTitle && (
              <p className="text-sm font-semibold text-slate-700 mb-1">{milestoneTitle}</p>
            )}

            {amountFormatted ? (
              <p className="text-2xl font-bold text-emerald-600 my-3">{amountFormatted}</p>
            ) : null}

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Funds held in escrow — released only when you approve
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 font-bold"
                onClick={() => {
                  if (contractId) router.push(`/contracts/${contractId}`);
                  else router.push('/contracts/me');
                }}
              >
                View Contract
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full font-bold"
                onClick={() => router.push('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">What happens next?</p>
          <div className="space-y-3.5">
            {[
              { step: "1", title: "Freelancer is notified", desc: "They've been alerted that the milestone is funded and work can begin.", done: true },
              { step: "2", title: "Freelancer completes the work", desc: "They'll mark the milestone done once finished." },
              { step: "3", title: "You review and approve", desc: "Go to the contract, review the work, then approve to release the funds." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${s.done ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-700"}`}>
                  {s.done ? <CheckCircle2 className="size-3.5" /> : s.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          A confirmation has been recorded on your account.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
