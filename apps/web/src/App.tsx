/**
 * App Component
 * Main application router setup
 * Defines routes: login, career-paths, roadmap, dashboard
 * All routes except login are protected with ProtectedRoute
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

/**
 * App Root Component
 * Sets up React Router with all application routes
 *
 * Routes:
 * - / → LoginPage (public)
 * - /career-paths → CareerPathPage (protected)
 * - /roadmap → RoadmapPage (protected)
 * - /dashboard → DashboardPage (protected)
 * - /* → Redirect to / (404 fallback)
 *
 * @returns {JSX.Element} Router with all routes
 */
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />

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
