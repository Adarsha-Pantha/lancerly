"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function IndexRedirect() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/home");     // logged-in → dashboard
    else router.replace("/landing");        // guest → explore page
  }, [token, router]);

  return null;
}
