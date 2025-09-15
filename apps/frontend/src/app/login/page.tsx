"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "@/components/Button";

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: Errors = {};

    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";

    if (!password) next.password = "Password is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;

    // ✅ Ready to call your API (NestJS) later
    alert("Login form looks good! (Next: hook up API)");
  };

  const inputBase =
    "w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Login to Lancerly
        </h2>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`${inputBase} ${submitted && errors.email ? "border-red-400" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {submitted && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBase} pr-10 ${submitted && errors.password ? "border-red-400" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-5 py-2 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="text-indigo-600 hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
