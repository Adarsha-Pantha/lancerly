"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { get, post, onAuthFailure } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  role: "PENDING" | "CLIENT" | "FREELANCER" | "ADMIN";
  createdAt: string;
  name?: string | null;
  avatarUrl?: string | null;
  dob?: string | null;
  country?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  isComplete?: boolean | null;
  isSubscribed?: boolean;
};

type AuthResponse = {
  user: User;
  token: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "CLIENT" | "FREELANCER"
  ) => Promise<void>;
  loginWithToken: (jwt: string, maybeUser?: User) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load existing session (sync with localStorage)
  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u) as User);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Sync with server if we have a token (freshen stale localStorage)
  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await get<{ user: User }>("/auth/me", token);
        console.log("[AuthContext] Refreshed user from server:", data.user.email, "isSubscribed:", data.user.isSubscribed);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (err) {
        console.error("[AuthContext] Refresh failed:", err);
        // Only clear if it's a 401/403 (handled by onAuthFailure usually, but being safe)
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ✅ When API returns 401 / "jwt expired", clear session and redirect to login
  useEffect(() => {
    onAuthFailure.set(() => {
      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
      if (typeof window !== "undefined") {
        const path = window.location.pathname + window.location.search || "/";
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    });
    return () => {
      onAuthFailure.set(() => {});
    };
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const setAuth = (u: User, t: string) => {
      setUser(u);
      setToken(t);
      localStorage.setItem("token", t);
      localStorage.setItem("user", JSON.stringify(u));
    };

    const refreshUser = async (): Promise<User | null> => {
      if (!token) return null;
      try {
        const data = await get<{ user: User }>("/auth/me", token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      } catch {
        return null;
      }
    };

    return {
      user,
      token,
      loading,

      login: async (email, password) => {
        const res = await post<AuthResponse>("/auth/login", { email, password });
        setAuth(res.user, res.token);
      },

      register: async (name, email, password, role) => {
        await post<unknown>("/auth/register", { name, email, password, role });
      },

      loginWithToken: async (jwt, maybeUser) => {
        setToken(jwt);
        localStorage.setItem("token", jwt);

        if (maybeUser) {
          setUser(maybeUser);
          localStorage.setItem("user", JSON.stringify(maybeUser));
          return;
        }

        try {
          const data = await get<{ user: User }>("/auth/me", jwt);
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      },

      refreshUser,

      logout: () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      },
    };
  }, [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
