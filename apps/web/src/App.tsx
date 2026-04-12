/**
 * App Component
 * Demo router setup
 */
import { Routes, Route, Navigate } from "react-router-dom";
import SkillsTreePage from "./pages/SkillsTreePage";
import Layout from "./components/layouts/Layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Tự động chuyển hướng về roadmap id 2 khi vào trang chủ */}
        <Route path="/" element={<Navigate to="/skills-tree/2" replace />} />

        {/* CẬP NHẬT: Thêm :id để nhận roadmapId từ URL */}
        <Route path="/skills-tree/:id" element={<SkillsTreePage />} />

        {/* Các đường dẫn lạ đều quay về roadmap id 2 */}
        <Route path="*" element={<Navigate to="/skills-tree/2" replace />} />
      </Route>
    </Routes>
  );
}

export default App;