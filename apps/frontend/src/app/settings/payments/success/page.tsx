'use client';

import { Suspense } from 'react';
import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const milestoneId = searchParams.get('milestoneId');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntent) {
      toast.toast('Payment processed successfully!', 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-2">
              Your funds are now held in escrow for milestone{' '}
              <span className="font-semibold text-slate-700">
                #{milestoneId?.slice(-6).toUpperCase()}
              </span>
              .
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              The freelancer has been notified. Release the funds once you've reviewed and approved their work.
            </p>

            <div className="space-y-3">
              {milestoneId && (
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={() => {
                    // We stored contractId in the URL when possible; fall back to dashboard
                    const contractId = searchParams.get('contractId');
                    if (contractId) {
                      router.push(`/contracts/${contractId}`);
                    } else {
                      router.push('/contracts/me');
                    }
                  }}
                >
                  View Contract
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
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
