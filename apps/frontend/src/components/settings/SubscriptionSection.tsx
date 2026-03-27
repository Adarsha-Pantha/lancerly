"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { post } from "@/lib/api";
import { Check, Crown, Zap, Shield, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SubscriptionSection() {
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Sync with server on mount to ensure subscription status is accurate
  useEffect(() => {
    const syncSub = async () => {
      if (!token) return;
      
      // If returning from Stripe checkout success
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get("success") === "true") {
          try {
            const res = await post<{ isSubscribed: boolean }>("/stripe/sync-subscription", {}, token);
            
            if (res.isSubscribed) {
              toast.toast("Success! Your Lancerly Pro subscription is now active.", "success");
            }
            // Clean up URL to avoid syncing again on refresh
            window.history.replaceState({}, "", window.location.pathname + "?tab=subscription");
          } catch (e) {
            console.error("Failed to sync subscription", e);
          }
        }
      }
      refreshUser();
    };
    syncSub();
  }, [token, refreshUser, toast]);

  const isSubscribed = user?.isSubscribed ?? false;

  const handleSubscribe = async () => {
    console.log("[SubscriptionSection] handleSubscribe triggered");
    setLoading(true);
    try {
      console.log("[SubscriptionSection] Calling /stripe/create-subscription-session...");
      const { url } = await post<{ url: string }>(
        "/stripe/create-subscription-session",
        {},
        token ?? undefined
      );
      console.log("[SubscriptionSection] Received checkout URL:", url);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e) {
      console.error("[SubscriptionSection] Error in handleSubscribe:", e);
      toast.toast((e as Error).message || "Failed to start checkout", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await post("/stripe/subscribe", { subscribe: false }, token ?? undefined);
      toast.toast("Subscription cancelled. You are now on the Free plan.", "info");
      await refreshUser();
    } catch (e) {
      toast.toast((e as Error).message || "Failed to cancel", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className={`overflow-hidden border-2 ${isSubscribed ? "border-primary/50" : "border-border"}`}>
        <div className={`h-2 w-full ${isSubscribed ? "bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#EC4899]" : "bg-muted"}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Crown className="text-yellow-500 fill-yellow-500" size={24} />
                    Lancerly Pro
                  </>
                ) : (
                  "Lancerly Free"
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {isSubscribed 
                  ? "You have full access to all premium features." 
                  : "Upgrade to unlock unlimited project creation and more."}
              </CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isSubscribed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {isSubscribed ? "Active" : "Current Plan"}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">What&apos;s included:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 size-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="text-emerald-600" size={12} />
                  </div>
                  <span className={isSubscribed ? "text-foreground font-medium" : "text-muted-foreground"}>
                    <strong>Unlimited</strong> project creation per week
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 size-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="text-emerald-600" size={12} />
                  </div>
                  <span className={isSubscribed ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Priority support and dispute resolution
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 size-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="text-emerald-600" size={12} />
                  </div>
                  <span className={isSubscribed ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Advanced AI project brief refiner
                  </span>
                </li>
              
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center space-y-4">
              {!isSubscribed ? (
                <>
                  <div className="space-y-1">
                    <span className="text-4xl font-bold text-foreground">$29</span>
                    <span className="text-muted-foreground ml-1">/ month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited access and scale your business with Lancerly Pro.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-90 transition-opacity h-11"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : (
                      <>
                        <Zap size={16} className="fill-current" />
                        Upgrade to Pro — $29/mo
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">You&apos;re all set!</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      Thank you for being a Pro member. You have unlimited project posts.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 text-destructive hover:bg-destructive/5"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Cancel Subscription"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: "Fast Approval", color: "text-blue-500" },
          { icon: Shield, label: "Secure Payments", color: "text-emerald-500" },
          { icon: Star, label: "Top Freelancers", color: "text-purple-500" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border shadow-sm">
            <item.icon className={item.color} size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
