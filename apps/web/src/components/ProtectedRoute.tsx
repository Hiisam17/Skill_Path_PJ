/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * Usage:
 * ```jsx
 * <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
 * ```
 */

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * Checks AuthContext to verify user is authenticated
 * If not authenticated, redirects to login page
 *
 * @param {ReactNode} children - Component to render if authenticated
 * @returns {JSX.Element} Children component or redirect to login
 */
export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
