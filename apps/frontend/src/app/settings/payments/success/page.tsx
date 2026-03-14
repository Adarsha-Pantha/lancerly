'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const milestoneId = searchParams.get('milestoneId');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntent) {
      toast.toast('Payment processed successfully!', 'success');
      // No dependencies on 'toast' here if we only want it on first load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentIntent]);

  return (
    <div className="max-w-xl mx-auto mt-16 text-center">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment for milestone #{milestoneId?.slice(-6)} has been processed and is now held in escrow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            The freelancer has been notified. You can manage this milestone and release funds once the work is delivered and approved.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            <Button variant="outline" onClick={() => router.push('/admin/finance')}>View Finance Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
