"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

type User = {
  id: number;
  username: string;
  email: string;
  role?: string | null;
  name?: string | null;
};

interface AuthContextType {
  user: User | null;
  access: string | null;
  isAuthenticated: boolean;
  login: (access: string, user: User) => void;
  logout: () => Promise<void>;
  ensureFreshAccess: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Guard: set to true the moment logout starts — stops all token refresh attempts
  const loggingOut = useRef(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

  // REFRESH ACCESS TOKEN ONLY WHEN NECESSARY
  const refreshAccess = useCallback(async (): Promise<string | null> => {
    if (loggingOut.current) return null;   // ← block refresh during logout
    try {
      const res = await fetch(`${API}/token/refresh-cookie/`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      setAccess(data.access);
      return data.access;
    } catch {
      return null;
    }
  }, [API]);

  // Called ONLY by useAuthFetch if a 401 occurs
  const ensureFreshAccess = useCallback(async () => {
    if (loggingOut.current) return null;   // ← block refresh during logout
    return access || (await refreshAccess());
  }, [access, refreshAccess]);

  const login = (newAccess: string, newUser: User) => {
    loggingOut.current = false;
    setAccess(newAccess);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    // Signal immediately — any in-flight ensureFreshAccess calls will abort
    loggingOut.current = true;

    // 1. Tell the backend to invalidate the refresh token cookie
    try {
      await fetch(`${API}/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    // 2. Clear all auth-related cookies (cover all naming variants)
    const cookiesToClear = ["access", "refresh", "accessToken", "refreshToken"];
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/;`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
    });

    // 3. Reset in-memory auth state
    setAccess(null);
    setUser(null);
    setIsAuthenticated(false);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        access,
        isAuthenticated,
        login,
        logout,
        ensureFreshAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
