// apps/frontend/src/app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Errors = { email?: string; password?: string; form?: string; };

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const justRegistered = sp.get("registered") === "1";

  const { login, token } = useAuth();

  // 👇 redirect if already logged in
  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    setLoading(true);
    setErrors((p) => ({ ...p, form: undefined }));
    try {
      await login(email, password);
      router.replace("/");
    } catch (err: any) {
      setErrors((p) => ({ ...p, form: err?.message || "Login failed." }));
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none";

  // Avoid flashing the form for an already-authenticated user
  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Login to Lancerly
        </h2>

        {justRegistered && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Account created successfully. Please sign in.
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              autoComplete="email"
              type="email"
              placeholder="you@example.com"
              className={`${inputBase} ${submitted && errors.email ? "border-red-400" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!(submitted && errors.email)}
              aria-describedby={submitted && errors.email ? "email-error" : undefined}
            />
            {submitted && errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBase} pr-10 ${submitted && errors.password ? "border-red-400" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!(submitted && errors.password)}
                aria-describedby={submitted && errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {submitted && errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Form error */}
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="mx-3 text-xs uppercase tracking-wide text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google login */}
        <div className="space-y-2">
          <a
            href={`${apiBase}/auth/google`}
            className="flex w-full items-center justify-center rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Continue with Google
          </a>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
