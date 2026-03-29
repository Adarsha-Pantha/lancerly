"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { put } from "@/lib/api";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  User,
  Sparkles,
  Check,
  Target,
  TrendingUp,
} from "lucide-react";

const roles = [
  {
    type: "CLIENT" as const,
    title: "I'm a Client",
    description: "Looking to hire talented freelancers for my projects",
    icon: Briefcase,
    features: [
      "Post projects and find talent",
      "Review proposals and hire experts",
      "Manage projects and payments",
      "Access AI-powered matching",
    ],
    accent: "primary" as const,
  },
  {
    type: "FREELANCER" as const,
    title: "I'm a Freelancer",
    description: "Looking for work and showcasing my skills",
    icon: User,
    features: [
      "Browse and apply for projects",
      "Build your professional profile",
      "Get paid securely",
      "Showcase your portfolio",
    ],
    accent: "accent" as const,
  },
];

export default function RoleSelectionPage() {
  const { token, user, refreshUser } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirect") || "";
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "FREELANCER" | null>(null);

  const handleRoleSelect = async (role: "CLIENT" | "FREELANCER") => {
    setLoading(true);
    try {
      await put("/auth/role", { role }, token || "");
      await refreshUser();
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.push("/profile/setup");
      }
    } catch (error) {
      console.error("Failed to set role:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [user, router]);

  if (!token || !user) {
    router.push("/login");
    return null;
  }

  return (
    <SiteLayout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Welcome to Lancerly!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us how you&apos;ll use the platform so we can personalize your experience.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {roles.map((role) => {
              const isSelected = selectedRole === role.type;
              const Icon = role.icon;
              const isClient = role.type === "CLIENT";

              return (
                <button
                  key={role.type}
                  type="button"
                  onClick={() => setSelectedRole(role.type)}
                  className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        isClient ? "bg-primary/15 text-primary" : "bg-[#7C3AED]/15 text-[#7C3AED]"
                      }`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {role.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isClient ? "bg-primary/15" : "bg-[#7C3AED]/15"
                          }`}
                        >
                          {isClient ? (
                            <Target className="w-3 h-3 text-primary" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-[#7C3AED]" />
                          )}
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Action */}
          <div className="text-center">
            <Button
              onClick={() => selectedRole && handleRoleSelect(selectedRole)}
              disabled={!selectedRole || loading}
              size="lg"
              className="min-w-[240px]"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue to Profile Setup
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              You can change this later in settings
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
