'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/stripe/CheckoutForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Briefcase,
  User,
  FileText,
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type MilestoneInfo = {
  title: string;
  description: string | null;
  projectTitle: string;
  contractId: string;
  freelancerName: string;
  amountCents: number;
  clientFeeCents: number;
  totalCents: number;
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function PaymentPage({ params }: { params: { milestoneId: string } }) {
  const { token } = useAuth();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<MilestoneInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    // Handle Stripe redirect back after 3DS
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('redirect_status') === 'succeeded') {
        router.replace(`/settings/payments/success?milestoneId=${params.milestoneId}`);
        return;
      }
    }

    const fetchPaymentIntent = async () => {
      try {
        const data = await post<{ clientSecret: string; milestone: MilestoneInfo }>(
          `/stripe/milestones/${params.milestoneId}/payment-intent`,
          {},
          token
        );
        setClientSecret(data.clientSecret);
        setMilestone(data.milestone);
      } catch (err) {
        setError((err as Error).message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [params.milestoneId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Preparing secure checkout…</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isOnboarding =
      error.includes('onboarding') ||
      error.includes('Connect') ||
      error.includes('capability') ||
      error.includes('transfers');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`rounded-2xl border p-8 bg-white shadow-sm ${isOnboarding ? 'border-amber-200' : 'border-red-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isOnboarding ? 'bg-amber-100' : 'bg-red-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${isOnboarding ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-lg font-bold mb-2 ${isOnboarding ? 'text-amber-900' : 'text-red-900'}`}>
              {isOnboarding ? 'Freelancer Setup Required' : 'Payment Error'}
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {isOnboarding
                ? "The freelancer hasn't connected their Stripe account yet. Ask them to go to Settings → Payments → Setup Stripe."
                : error}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contract
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Back button */}
        <button
          onClick={() => milestone ? router.push(`/contracts/${milestone.contractId}`) : window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contract
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Order summary */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Fund Milestone</h1>
              <p className="text-sm text-slate-500 mt-1">
                Funds are held in escrow and released when you approve the work.
              </p>
            </div>

            {/* Milestone card */}
            {milestone && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Milestone</p>
                    <p className="font-bold text-slate-900 mt-0.5">{milestone.title}</p>
                    {milestone.description && (
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{milestone.description}</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{milestone.projectTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{milestone.freelancerName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            {milestone && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Payment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Milestone amount</span>
                    <span className="font-medium text-slate-900">{fmt(milestone.amountCents)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Processing fee</span>
                    <span className="font-medium text-slate-900">{fmt(milestone.clientFeeCents)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <span className="font-bold text-slate-900">Total charged</span>
                    <span className="font-bold text-lg text-violet-700">{fmt(milestone.totalCents)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Escrow Protection</p>
                    <p className="text-xs text-slate-500">Funds are held securely until you approve the work.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">256-bit SSL Encryption</p>
                    <p className="text-xs text-slate-500">Your payment details are encrypted by Stripe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Stripe form */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-slate-400" />
                <h2 className="text-base font-bold text-slate-900">Secure Payment</h2>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#7c3aed',
                      borderRadius: '10px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    },
                  },
                }}
              >
                <CheckoutForm
                  milestoneId={params.milestoneId}
                  contractId={milestone?.contractId}
                />
              </Elements>

              <p className="mt-5 text-center text-[11px] text-slate-400">
                Powered by{' '}
                <span className="font-semibold text-slate-500">Stripe</span>
                {' '}· Your card is never stored on our servers.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
