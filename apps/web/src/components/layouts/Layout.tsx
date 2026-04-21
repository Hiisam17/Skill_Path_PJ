import { Outlet } from "react-router-dom"; // BẮT BUỘC PHẢI CÓ DÒNG NÀY
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden">
      
      {/* Cột trái: Sidebar */}
      <Sidebar />

      {/* Cột phải: Nội dung chính */}
      <div className="flex flex-col flex-1 h-full w-full">
        <TopBar />
        
        <main className="flex-1 relative w-full h-full">
          {/* ĐÂY LÀ CHỖ REACT ROUTER SẼ NHÉT TRANG SKILL TREE VÀO */}
          {/* NẾU THIẾU THẺ NÀY, TRANG SẼ TRẮNG TINH */}
          <Outlet /> 
        </main>
      </div>

    </div>
  );
}