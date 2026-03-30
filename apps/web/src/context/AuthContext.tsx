/**
 * Authentication Context
 * Manages global auth state: current user, login/logout functions, token
 *
 * Usage:
 * ```
 * const { user, login, logout } = useContext(AuthContext);
 * ```
 */

import { createContext, useContext, useState } from "react";
/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-unused-vars */
import type { ReactNode } from "react";
import type { UserDto, LoginDto } from "@/types";
import { clearAuthToken } from "@/services/api";

// ───── CONTEXT TYPE ─────
/**
 * Shape of AuthContext value
 */
interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (loginDto: LoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ───── CREATE CONTEXT ─────
/**
 * Auth context for accessing authentication state and methods globally
 * @default { user: null, isLoading: false, error: null, isAuthenticated: false }
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// ───── PROVIDER COMPONENT ─────
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component - wrap app with this to provide auth context
 *
 * @example
 * ```jsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user login
   * @param {LoginDto} loginDto - Email and password
   * @throws {Error} If API call fails
   */
  const login = async (_loginDto: LoginDto): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Call POST /auth/login endpoint
      // const response = await api.post<AuthResponseDto>('/auth/login', loginDto);
      // const { token, user } = response.data;
      // setAuthToken(token);
      // setUser(user);
      throw new Error("Not implemented");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user logout
   * Clears token and user from state/storage
   */
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * @returns {AuthContextType} Auth state and methods
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
