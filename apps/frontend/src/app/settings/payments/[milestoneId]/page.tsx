'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from '@/components/stripe/CheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { post } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentPage({ params }: { params: { milestoneId: string } }) {
  const { token } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchPaymentIntent = async () => {
      try {
        const data = await post<{ clientSecret: string }>(
          `/stripe/milestones/${params.milestoneId}/payment-intent`,
          {},
          token
        );
        setClientSecret(data.clientSecret);
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
      <div className="max-w-xl mx-auto mt-8">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    const isOnboardingError = error.includes('onboarding first');
    return (
      <div className="max-w-xl mx-auto mt-8">
        <Card className={isOnboardingError ? "border-amber-200" : "border-destructive"}>
          <CardHeader>
            <CardTitle className={isOnboardingError ? "text-amber-800" : "text-destructive"}>
              {isOnboardingError ? "Freelancer Onboarding Required" : "Error"}
            </CardTitle>
            <CardDescription className="text-base text-slate-700 font-medium">
              {isOnboardingError 
                ? "The freelancer hasn't connected their Stripe account yet. They must do this before you can fund milestones."
                : error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isOnboardingError && (
              <p className="text-sm text-slate-600 mb-4">
                You can ask the freelancer to go to their <strong>Settings {'>'} Payments</strong> and click <strong>Connect Stripe</strong>. 
                Once they complete that, you'll be able to pay for this milestone.
              </p>
            )}
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Contract
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Fund Milestone</CardTitle>
          <CardDescription>
            Securely fund this milestone using Stripe. The funds will be held in escrow until you approve the work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm milestoneId={params.milestoneId} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
