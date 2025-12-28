"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { needsCompletion } from "@/lib/auth";
import { get } from "@/lib/api";

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
        // fetch current user with the token we just received
        const data = await get<{ user: any }>("/auth/me", token);

        // store token + user in AuthContext/localStorage
        loginWithToken(token, data.user);
        router.replace(needsCompletion(data.user) ? "/profile/setup" : "/");
      } catch (e: any) {
        console.error("OAuth finalize failed:", e);
        // Better error message for debugging
        const errorMsg = e?.message || "Failed to complete sign-in";
        console.error("Error details:", errorMsg);
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
