"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, ArrowRight } from "lucide-react";

/**
 * Minimal implementation to restore build.
 * You can later wire this to real subscription endpoints.
 */
export function SubscriptionSection() {
  const { user } = useAuth();

  return (
    <Card className="border-violet-200/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-5 text-violet-600" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your plan and limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-white border border-violet-200">
              <Sparkles className="size-4 text-violet-700" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-violet-900">
                {user?.role === "CLIENT" ? "Client plan" : "Freelancer plan"}
              </p>
              <p className="text-xs text-violet-800/80 mt-1 leading-relaxed">
                Subscription features are currently in progress. This section is kept to prevent build errors after cleanup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/settings?tab=payments">
              Payments
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Go to dashboard <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

