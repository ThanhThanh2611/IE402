import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AuthUser, LoginResponse } from "@/types";
import { api, clearStoredAuth, setStoredAuth } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): AuthUser | null {
  const saved = localStorage.getItem("user");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken") || localStorage.getItem("token"),
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    localStorage.getItem("refreshToken"),
  );

  useEffect(() => {
    if (user && accessToken && refreshToken) {
      setStoredAuth({ user, accessToken, refreshToken });
    }
  }, [user, accessToken, refreshToken]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.post<LoginResponse>("/auth/login", {
      username,
      password,
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setStoredAuth({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Logout vẫn nên tiếp tục xóa phiên cục bộ dù revoke thất bại
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      clearStoredAuth();
    }
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isManager: user?.role === "manager",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
