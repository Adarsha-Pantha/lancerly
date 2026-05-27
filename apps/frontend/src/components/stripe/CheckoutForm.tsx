"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CheckoutForm({
  milestoneId,
  contractId,
}: {
  milestoneId: string;
  contractId?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const successUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/settings/payments/success?milestoneId=${milestoneId}${contractId ? `&contractId=${contractId}` : ""}`
      : `/settings/payments/success?milestoneId=${milestoneId}${contractId ? `&contractId=${contractId}` : ""}`;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setSubmitting(true);
        setMessage(null);
        try {
          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Used only for redirect-based payments (3DS, bank redirects)
              return_url: successUrl,
            },
            redirect: "if_required",
          });
          if (result.error) {
            setMessage(result.error.message || "Payment failed. Please try again.");
          } else {
            // Payment confirmed without redirect
            router.push(successUrl);
          }
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-5"
    >
      <PaymentElement />
      {message && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full h-11 text-sm font-bold bg-violet-600 hover:bg-violet-700"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Processing…
          </span>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}
