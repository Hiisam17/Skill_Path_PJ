/**
 * Authentication context providing global auth state, login, and logout.
 */

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserDto, LoginDto } from "@/types";
import { api, setAuthToken, clearAuthToken, getAuthToken } from "@/services/api";

/** Shape of the AuthContext value. */
interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (loginDto: LoginDto) => Promise<void>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restore auth session from localStorage on mount.
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // TODO(auth): Validate token via GET /auth/me and populate user state.
      console.log('User session found in localStorage');
    }
  }, []);

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
    clearAuthToken();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user || !!getAuthToken(),
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
