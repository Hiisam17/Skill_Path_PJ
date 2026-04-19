/** Root application component defining all routes and their access control. */
import { Routes, Route, Navigate } from "react-router-dom";

// ── Imports Pages ──
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { ExploreRoadmapsPage } from "./pages/ExploreRoadmapsPage";
import SkillsTreePage from "./pages/SkillsTreePage";

// ── Imports Components & Auth ──
import Layout from "./components/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ── 1. PUBLIC ROUTES (Không cần đăng nhập) ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/* ── 2. ROOT ROUTE ── 
          Chuyển hướng mặc định vào Dashboard. 
          Nếu chưa đăng nhập, ProtectedRoute ở dưới sẽ tự động đá về /login. 
      */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── 3. PROTECTED ROUTES (Cần đăng nhập & Dùng chung Layout) ── */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Tất cả các trang bên trong này đều sẽ có Sidebar và Topbar từ Layout */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/career-paths" element={<CareerPathPage />} />
        <Route path="/explore" element={<ExploreRoadmapsPage />} />
        
        <Route path="/roadmaps/:roadmapId" element={<SkillsTreePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;