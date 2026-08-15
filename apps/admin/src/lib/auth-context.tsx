"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient, ApiError } from "./api-client";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextValue {
  staff: StaffUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<StaffUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOGIN_PATH = "/admin/login";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<StaffUser>("/admin-auth/me")
      .then((data) => {
        if (!cancelled) setStaff(data);
      })
      .catch(() => {
        if (!cancelled) setStaff(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!staff && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    }
    if (staff && pathname === LOGIN_PATH) {
      router.replace("/admin");
    }
  }, [loading, staff, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const authenticatedStaff = await apiClient.post<StaffUser>("/admin-auth/login", {
      email,
      password,
    });
    setStaff(authenticatedStaff);
    return authenticatedStaff;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/admin-auth/logout");
    } catch {
      // best-effort — clear local state regardless
    }
    setStaff(null);
    router.replace(LOGIN_PATH);
  }, [router]);

  return (
    <AuthContext.Provider value={{ staff, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
