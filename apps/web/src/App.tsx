/**
 * App Component
 * Demo router setup
 * Bypasses authentication and exposes Skill Tree only
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { CareerPathPage } from "./pages/CareerPathPage";
import { FrontendRoadmapPage } from "./pages/FrontendRoadmapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JavaScriptSkillTreePage } from "@/pages/JavaScriptSkillTreePage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

/**
 * App Root Component
 * Sets up React Router in Skill Tree demo mode
 *
 * Route behavior:
 * - / -> /skills-tree
 * - /skills-tree -> SkillsTreePage
 * - any other path -> /skills-tree
 *
 * @returns {JSX.Element} Router with all routes
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Các Route khác vẫn giữ nguyên vỏ bọc ProtectedRoute */}
      <Route
        path="/career-paths"
        element={
          <ProtectedRoute>
            <CareerPathPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/javascript-roadmap"
        element={
          <ProtectedRoute>
            <JavaScriptSkillTreePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/frontend-roadmap"
        element={
          <ProtectedRoute>
            <FrontendRoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
      </Route>

      {/* Fallback Route (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
