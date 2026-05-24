/**
 * Authentication context providing global auth state, login, and logout.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserDto, LoginDto } from "@/types";
import { api, setAuthToken, clearAuthToken, getAuthToken } from "@/services/api";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/** Shape of the AuthContext value. */
interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (loginDto: LoginDto) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserDto>) => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

/** Provides authentication state and methods to the component tree. */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeSupabaseUser = (supabaseUser: SupabaseUser): UserDto => {
    const metadata = supabaseUser.user_metadata || {};

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      fullName: metadata.full_name || metadata.name || metadata.user_name || "",
      avatarUrl: metadata.avatar_url || metadata.picture || "",
      bio: "",
      githubLink: "",
      createdAt: supabaseUser.created_at,
    };
  };

  const restoreBackendUser = useCallback(
    async (token: string, fallbackUser?: SupabaseUser | null) => {
      setAuthToken(token);
      const response = await api.get("/auth/me");
      const backendUser = response.data?.user;
      setUser(backendUser || (fallbackUser ? normalizeSupabaseUser(fallbackUser) : null));
      setIsAuthenticated(true);
    },
    [],
  );

  // Restore JWT or Supabase OAuth session on mount.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();

        if (token) {
          await restoreBackendUser(token);
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session?.access_token) {
          await restoreBackendUser(data.session.access_token, data.session.user);
          return;
        }

        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
      } catch (err) {
        console.error("Failed to restore session:", err);
        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (session?.access_token) {
          try {
            setIsLoading(true);
            await restoreBackendUser(session.access_token, session.user);
          } catch (err) {
            console.error("Failed to apply Supabase auth session:", err);
            clearAuthToken();
            setUser(null);
            setIsAuthenticated(false);
          } finally {
            if (isMounted) setIsLoading(false);
          }
          return;
        }

        if (event === "SIGNED_OUT") {
          clearAuthToken();
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      },
    );

    restoreSession();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [restoreBackendUser]);

  /**
   * Authenticates the user and stores the JWT token.
   *
   * @throws Error if the API call fails or no token is returned.
   */
  const login = async (loginDto: LoginDto): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<any>("/auth/login", loginDto);
      // Backend may return the token under different field names.
      const resp = response.data || {};
      const token = resp.token ?? resp.access_token ?? resp.accessToken ?? null;
      const userData = resp.user ?? resp.userData ?? null;

      if (!token) {
        throw new Error('No token returned from server');
      }

      setAuthToken(token);
      setIsAuthenticated(true);

      if (userData) setUser(userData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /** Clears token and user state, effectively logging the user out. */
  const logout = (): void => {
    void supabase.auth.signOut();
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  /** Updates user profile data locally and optionally on server if needed. */
  const updateUser = async (updatedData: Partial<UserDto>): Promise<void> => {
    try {
      const response = await api.patch("/users/profile", updatedData);
      if (response.data) {
        setUser(prev => prev ? { ...prev, ...response.data } : response.data);
      }
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth state and methods.
 *
 * @throws Error if used outside of AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
