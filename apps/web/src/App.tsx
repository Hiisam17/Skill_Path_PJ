/** Root application component defining all routes and their access control. */
import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";

// ── Imports Pages ──
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExploreRoadmapsPage } from "./pages/ExploreRoadmapsPage";
import SkillsTreePage from "./pages/SkillsTreePage";
import { JobMarketPage } from "./pages/JobMarketPage";
import FrontendRoadmapPage from "./pages/FrontendRoadmapPage";
import { JavaScriptSkillTreePage } from "./pages/JavaScriptSkillTreePage";

// ── Imports Components & Auth ──
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

/** Chỉ cho người CHƯA đăng nhập xem (login / sign-up).
 *  Nếu đã login → redirect về /dashboard. */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* ══ 1. ROOT — Điều hướng thông minh ══
          Chưa login → /login
          Đã login   → /dashboard  */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ══ 2. PUBLIC — Chỉ truy cập khi CHƯA đăng nhập ══ */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/sign-up" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />

      {/* ══ 3. PROTECTED — Cần đăng nhập, KHÔNG có Sidebar ══ */}
      <Route
        path="/career-paths"
        element={
          <ProtectedRoute>
            <CareerPathPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <ExploreRoadmapsPage />
          </ProtectedRoute>
        }
      />

      {/* ══ 4. PROTECTED — Cần đăng nhập, CÓ Sidebar từ Layout ══ */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/job-market" element={<JobMarketPage />} />
        <Route path="/roadmaps/:roadmapId" element={<SkillsTreePage />} />
        <Route path="/frontend-roadmap" element={<FrontendRoadmapPage />} />
        <Route path="/javascript-roadmap" element={<JavaScriptSkillTreePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;