"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { needsCompletion } from "@/lib/auth";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");

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
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        // store token + user in AuthContext/localStorage
        loginWithToken(token, data.user);
        router.replace(needsCompletion(data.user) ? "/profile/setup" : "/");
      } catch (e) {
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
