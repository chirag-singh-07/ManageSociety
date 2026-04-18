import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiLogin, apiLogout, getMe } from "@/src/api/client";
import { clearTokens, loadTokens, saveTokens } from "@/src/auth/token-store";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  flatNumber?: string;
  societyId: string;
  role: "user" | "admin";
};

type AuthContextValue = {
  loading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadProfile = async () => {
    const me = await getMe();
    setUser({
      id: me.user._id,
      name: me.user.name,
      email: me.user.email,
      phone: me.user.phone,
      flatNumber: me.user.flatNumber,
      societyId: me.user.societyId,
      role: me.user.role,
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const tokens = await loadTokens();
        if (!tokens) {
          setLoading(false);
          return;
        }
        await loadProfile();
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      isAuthenticated: !!user,
      user,
      login: async (email: string, password: string) => {
        const tokens = await apiLogin(email, password);
        await saveTokens(tokens);
        await loadProfile();
      },
      logout: async () => {
        await apiLogout();
        await clearTokens();
        setUser(null);
      },
      reloadMe: async () => {
        await loadProfile();
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
