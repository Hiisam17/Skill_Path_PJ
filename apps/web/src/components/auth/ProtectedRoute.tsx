/**
 * Gate component that restricts access to authenticated users only.
 * Redirects unauthenticated visitors to the root login page.
 */

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}
export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
