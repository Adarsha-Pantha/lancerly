"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Home route now mirrors the root redirect: feed for members, landing for guests
export default function HomePage() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace("/feed");
    } else {
      router.replace("/landing");
    }
  }, [token, router]);

  return null;
}
