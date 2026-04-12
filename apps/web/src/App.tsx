/**
 * App Component
 * Demo router setup
 * Bypasses authentication and exposes Skill Tree only
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { SkillsTreePage } from "./pages/SkillsTreePage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { FrontendRoadmapPage } from "./pages/FrontendRoadmapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import Layout from "./components/Layout";

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

      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/skills-tree" replace />} />
        <Route path="/career-path" element={<CareerPathPage />} />
        <Route path="/skills-tree" element={<SkillsTreePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/frontend-roadmap" element={<FrontendRoadmapPage />} />
        <Route path="*" element={<Navigate to="/skills-tree" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
