"use client";

import Navbar from "@/components/Navbar";

/**
 * Compatibility wrapper.
 * Some pages still import `LandingNavbar` from older iterations.
 * We keep this file so builds don't break after cleanup.
 */
export default function LandingNavbar() {
  return <Navbar />;
}

