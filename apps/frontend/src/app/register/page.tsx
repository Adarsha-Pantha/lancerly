"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, UserCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import AnimatedButton from "@/components/ui/AnimatedButton";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  form?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"client" | "freelancer">("client");

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!role) next.role = "Select a role.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, form: undefined }));
    try {
      const mappedRole = role === "client" ? "CLIENT" : "FREELANCER";
      await post("/auth/register", { name, email, password, role: mappedRole });
      router.push("/login?registered=1");
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err?.message || "Registration failed" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 px-4 py-12">
      <div className="w-full max-w-md animate-slideUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Join Lancerly</h1>
          <p className="text-slate-600">Create your account and start your journey</p>
        </div>

        {/* Form Card */}
        <div className="glass-effect rounded-2xl shadow-soft p-8">
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="name"
                  autoComplete="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 ${
                    submitted && errors.name ? "border-red-400" : "border-slate-200"
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {submitted && errors.name && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="email"
                  autoComplete="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 ${
                    submitted && errors.email ? "border-red-400" : "border-slate-200"
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
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 ${
                    submitted && errors.password ? "border-red-400" : "border-slate-200"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {submitted && errors.password && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="confirm"
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 ${
                    submitted && errors.confirmPassword ? "border-red-400" : "border-slate-200"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {submitted && errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    role === "client"
                      ? "border-purple-600 bg-purple-50"
                      : "border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <UserCheck className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-semibold text-slate-900">Client</p>
                  <p className="text-xs text-slate-600 mt-1">Hire talent</p>
                  {role === "client" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("freelancer")}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    role === "freelancer"
                      ? "border-purple-600 bg-purple-50"
                      : "border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <UserCheck className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="font-semibold text-slate-900">Freelancer</p>
                  <p className="text-xs text-slate-600 mt-1">Find work</p>
                  {role === "freelancer" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              </div>
              {submitted && errors.role && (
                <p className="mt-2 text-sm text-red-600 animate-fadeIn">{errors.role}</p>
              )}
            </div>

            {/* Form error */}
            {errors.form && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fadeIn">
                {errors.form}
              </div>
            )}

            {/* Submit */}
            <AnimatedButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<Sparkles size={18} />}
              className="w-full"
            >
              Create Account
            </AnimatedButton>
          </form>

          <p className="text-center text-sm text-slate-600 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
