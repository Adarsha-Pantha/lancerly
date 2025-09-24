// apps/frontend/src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { get, post } from "@/lib/api";

export type User = {
  id: string;
  email: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
  createdAt: string;

  // Profile fields (optional)
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
};

type AuthResponse = {
  user: User;
  token: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;

  /** Email/password login → stores token & user */
  login: (email: string, password: string) => Promise<void>;

  /** Register (no auto-login). Redirect to /login on the page after this resolves. */
  register: (
    name: string,
    email: string,
    password: string,
    role: "CLIENT" | "FREELANCER"
  ) => Promise<void>;

  /** Store a JWT from OAuth (?token=...) and hydrate user (if not passed). */
  loginWithToken: (jwt: string, maybeUser?: User) => Promise<void>;

  /** Re-fetch the current user using stored token. */
  refreshUser: () => Promise<User | null>;

  /** Clear local auth state */
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load existing session (if any) from localStorage
  useEffect(() => {
    try {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u) as User);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // If we have a token but no user (e.g., page refresh after OAuth), hydrate from /auth/me
  useEffect(() => {
    (async () => {
      if (!token || user) return;
      try {
        const data = await get<{ user: User }>("/auth/me", token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        // token invalid/expired; clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    })();
  }, [token, user]);

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

      login: async (email, password) => {
        const res = await post<AuthResponse>("/auth/login", { email, password });
        setAuth(res.user, res.token);
      },

      register: async (name, email, password, role) => {
        await post<unknown>("/auth/register", { name, email, password, role });
        // (Do not set token/user; the Register page will redirect to /login)
      },

      loginWithToken: async (jwt, maybeUser) => {
        setToken(jwt);
        localStorage.setItem("token", jwt);

        if (maybeUser) {
          setUser(maybeUser);
          localStorage.setItem("user", JSON.stringify(maybeUser));
          return;
        }

        // fetch the user if not provided
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
  }, [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
