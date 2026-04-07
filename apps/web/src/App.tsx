import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { CareerPathPage } from "@/pages/CareerPathPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { JavaScriptSkillTreePage } from "@/pages/JavaScriptSkillTreePage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/**
 * Main Application Component
 * Manages routing and layout
 */
function App() {
  return (
    <Routes>
      {/* Auth Routes (Public) */}
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
        path="/roadmap"
        element={<RoadmapPage />}
      />

      {/* ĐÃ SỬA: Bỏ vỏ bọc ProtectedRoute cho riêng trang Dashboard để bạn test */}
      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      {/* Trang Roadmap JavaScript */}
      <Route
        path="/javascript-roadmap"
        element={<JavaScriptSkillTreePage />}
      />

      {/* Fallback Route (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
