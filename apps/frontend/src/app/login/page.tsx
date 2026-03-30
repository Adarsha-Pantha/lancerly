"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AnimatedButton from "@/components/ui/AnimatedButton";
import LandingNavbar from "@/components/LandingNavbar";

type Errors = { email?: string; password?: string; form?: string };

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:3001";

const REDIRECT_KEY = "postLoginRedirect";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const justRegistered = sp.get("registered") === "1";
  const redirectTo = sp.get("redirect") || "";

  const { login, token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
        return;
      }
      const url = typeof window !== "undefined" ? sessionStorage.getItem(REDIRECT_KEY) : null;
      if (url) sessionStorage.removeItem(REDIRECT_KEY);
      router.replace(url || redirectTo || "/");
    }
  }, [token, user, router, redirectTo]);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleLogin = () => {
    try {
      setGoogleError("");
      if (redirectTo && typeof window !== "undefined") {
        sessionStorage.setItem(REDIRECT_KEY, redirectTo);
      }
      const googleAuthUrl = `${apiBase}/auth/google`;
      console.log("Redirecting to Google OAuth:", googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google login error:", error);
      setGoogleError("Google login is currently unavailable. Please try regular login.");
    }
  };

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
    } catch (err: any) {
      setErrors((p) => ({ ...p, form: err?.message || "Login failed." }));
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2C304B] font-medium">Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <LandingNavbar />
      <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA] px-4">
        <div className="w-full max-w-md animate-slideUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#7C3AED] rounded-2xl mb-4 shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-[#2C304B] mb-2">Welcome Back</h1>
          <p className="text-[#64748B]">Sign in to continue to Lancerly</p>
        </div>

        {/* Form Card */}
        <div className="glass-effect rounded-3xl p-8">
          {justRegistered && (
              <div className="mb-6 rounded-2xl shadow-clay-inner bg-green-50/80 px-4 py-3 text-sm text-green-700 animate-fadeIn border border-green-200/50">
              ✅ Account created successfully. Please sign in.
            </div>
          )}

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-brand-purple-dark mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50" size={20} />
                <input
                  id="email"
                  autoComplete="email"
                  type="email"
                  placeholder="you@example.com"
                  suppressHydrationWarning
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all bg-white ${
                    submitted && errors.email ? "!border-red-400 !shadow-none" : ""
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {submitted && errors.email && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-brand-purple-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-purple/50" size={20} />
                <input
                  id="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  suppressHydrationWarning
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all bg-white ${
                    submitted && errors.password ? "!border-red-400 !shadow-none" : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-purple/50 hover:text-brand-purple transition-colors"
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {submitted && errors.password && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.password}</p>
              )}
            </div>

            {/* Form error */}
            {errors.form && (
              <div className="rounded-2xl shadow-clay-inner bg-red-50/80 px-4 py-3 text-sm text-red-700 animate-fadeIn border border-red-200/50">
                {errors.form}
              </div>
            )}

            {/* Submit */}
            <AnimatedButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<LogIn size={18} />}
              className="w-full"
              suppressHydrationWarning
            >
              Sign In
            </AnimatedButton>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="mx-4 text-xs uppercase tracking-wide text-slate-blue/60 font-semibold">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-2xl shadow-clay px-4 py-3 font-semibold text-slate-blue hover:shadow-clay-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            suppressHydrationWarning
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {googleError && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fadeIn">
              {googleError}
            </div>
          )}

          <p className="text-center text-sm text-slate-blue/80 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-mint hover:text-mint/80 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}
