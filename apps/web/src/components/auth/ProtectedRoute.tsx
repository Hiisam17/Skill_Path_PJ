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
  const { isAuthenticated, isLoading } = useAuth();

  // While we're checking the token or fetching user data on refresh,
  // show a loading screen to avoid premature redirection.
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0b1326',
        color: '#dae2fd'
      }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
