'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';

interface CheckoutFormProps {
  milestoneId: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ milestoneId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings/payments/success?milestoneId=${milestoneId}`,
      },
    });

    if (error) {
      toast.toast(error.message ?? 'An unexpected error occurred.', 'error');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-background">
        <PaymentElement />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};
