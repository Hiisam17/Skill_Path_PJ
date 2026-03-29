/**
 * App Component
 * Main application router setup
 * Defines routes: login, sign-up, career-paths, roadmap, dashboard
 * Auth routes (login, sign-up) are public
 * All other routes are protected with ProtectedRoute
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

/**
 * App Root Component
 * Sets up React Router with all application routes
 *
 * Public Routes:
 * - / → Redirect to /login
 * - /login → LoginPage
 * - /sign-up → SignUpPage
 *
 * Protected Routes:
 * - /career-paths → CareerPathPage
 * - /roadmap → RoadmapPage
 * - /dashboard → DashboardPage
 *
 * Fallback:
 * - /* → Redirect to /login (404)
 *
 * @returns {JSX.Element} Router with all routes
 */
function App() {
  return (
    <Routes>
      {/* Auth Routes (Public) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route
        path="/career-paths"
        element={
          <ProtectedRoute>
            <CareerPathPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
