"use client";

import Link from "next/link";
import Button from "./Button";
import { useAuth } from "@/context/AuthContext";

// Build API base from env
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(
  /\/+$/,
  ""
);

// Normalize avatar URL (adds API prefix if backend returned a relative path)
function toPublicUrl(p?: string | null) {
  if (!p) return "";
  return /^https?:\/\//i.test(p) ? p : `${API}${p}`;
}

export default function Navbar() {
  const { user, logout } = useAuth();

  // DiceBear fallback avatar
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    user?.name || "User"
  )}`;

  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 py-4">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        Lancerly
      </Link>

      <ul className="flex items-center space-x-4 text-gray-700">
        <li>
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
        </li>
        <li>
          <Link href="/projects" className="hover:text-indigo-600">
            Projects
          </Link>
        </li>

        {!user ? (
          <>
            <li>
              <Button variant="secondary" href="/login">
                Login
              </Button>
            </li>
            <li>
              <Button variant="primary" href="/register">
                Register
              </Button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:text-indigo-600"
              >
                <span className="relative inline-flex h-8 w-8 overflow-hidden rounded-full bg-indigo-100">
                  <img
                    src={toPublicUrl(user.avatarUrl) || fallback}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="max-w-[140px] truncate">
                  {user.name || "User"}
                </span>
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
