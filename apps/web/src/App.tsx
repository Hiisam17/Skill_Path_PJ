import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { CareerPathPage } from "./pages/CareerPathPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LoginPage />} />

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
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />

      {/* ĐÃ SỬA: Bỏ vỏ bọc ProtectedRoute cho riêng trang Dashboard để bạn test */}
      <Route
        path="/dashboard"
        element={<DashboardPage />}
      />

      {/* Fallback Route (404) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;