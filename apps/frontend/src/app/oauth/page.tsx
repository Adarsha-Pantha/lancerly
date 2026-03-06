"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { needsCompletion, needsRoleSelection } from "@/lib/auth";
import { get } from "@/lib/api";

const REDIRECT_KEY = "postLoginRedirect";

export default function OAuthLanding() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");
  const { loginWithToken } = useAuth();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const data = await get<{ user: any }>("/auth/me", token);
        loginWithToken(token, data.user);

        const redirectUrl =
          typeof window !== "undefined" ? sessionStorage.getItem(REDIRECT_KEY) : null;
        if (redirectUrl) sessionStorage.removeItem(REDIRECT_KEY);

        if (needsRoleSelection(data.user)) {
          router.replace(redirectUrl ? `/role-selection?redirect=${encodeURIComponent(redirectUrl)}` : "/role-selection");
        } else if (needsCompletion(data.user)) {
          router.replace(redirectUrl ? `/profile/setup?redirect=${encodeURIComponent(redirectUrl)}` : "/profile/setup");
        } else {
          router.replace(redirectUrl || "/");
        }
      } catch (e: any) {
        console.error("OAuth finalize failed:", e);
        router.replace("/login");
      }
    })();
  }, [token, router, loginWithToken]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-gray-600">
      Finishing sign-in…
    </div>
  );
}
