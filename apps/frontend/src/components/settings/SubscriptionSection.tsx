"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { get, post } from "@/lib/api";
import { Check, Crown, Zap, Shield, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SubscriptionSection() {
  const { user, token, refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string; type: "success" | "error" | "info" | null }>({ message: "", type: null });

  // Sync with server on mount to ensure subscription status is accurate
  useEffect(() => {
    const checkSync = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const isSuccess = searchParams.get("success") === "true";
      
      // Auto-sync only when returning from Stripe success or if success param is present
      if (token && isSuccess) {
        setLoading(true);
        setSyncStatus({ message: "Checking Stripe for latest active subscription...", type: "info" });
        console.log(`[SubscriptionCheck] Triggering auto-sync for user: ${user?.email}`);
        try {
          const res = await post<{ isSubscribed: boolean; message: string }>("/stripe/sync-subscription", {}, token);
          console.log(`[SubscriptionCheck] Sync result: ${JSON.stringify(res)}`);
          
          if (res.isSubscribed) {
            setSyncStatus({ message: "Perfect! Your Pro status is now active.", type: "success" });
            toast.toast("Subscription status updated!", "success");
          } else {
            setSyncStatus({ message: `No active subscription found. ${res.message || ""}`, type: "error" });
          }

          if (isSuccess) {
            const url = new URL(window.location.href);
            url.searchParams.delete("success");
            window.history.replaceState({}, "", url.pathname + url.search);
          }
          
          await refreshUser();
        } catch (e: any) {
          console.error("Auto-sync failed:", e);
          setSyncStatus({ message: `Sync failed: ${e.message || "Unknown error"}`, type: "error" });
        } finally {
          setLoading(false);
        }
      } else if (token) {
        // Just refresh user state from server, don't trigger a Stripe sync automatically
        refreshUser();
      }
    };
    
    checkSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshUser, toast]);

  const isSubscribed = user?.isSubscribed ?? false;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { url } = await post<{ url: string }>(
        "/stripe/create-subscription-session",
        {},
        token ?? undefined
      );
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (e) {
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
      {syncStatus.message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          syncStatus.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
          syncStatus.type === "error" ? "bg-destructive/10 border-destructive/20 text-destructive" :
          "bg-blue-500/10 border-blue-500/20 text-blue-500"
        }`}>
          {syncStatus.type === "info" && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          <p className="text-sm font-medium">{syncStatus.message}</p>
        </div>
      )}

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
                    <Crown size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-primary">Lancerly Pro Active!</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      Thank you for being a Pro member. You now have unlimited access.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
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
