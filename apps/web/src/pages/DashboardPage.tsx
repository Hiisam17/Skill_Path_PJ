import React, { useState, useEffect } from "react";
import { ProgressBar } from "../components/ProgressBar";

interface ProgressData {
  completedSkills: number;
  totalSkills: number;
  percentage: number;
}

export const DashboardPage: React.FC = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/progress');
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        setProgress(data);
      } catch (err) {
        console.error("Lỗi khi tải tiến độ:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  return (
    // Sử dụng màu nền tối gốc từ file HTML
    <div className="min-h-screen bg-[#0d1321] text-white p-4 lg:p-8 font-sans">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Bảng điều khiển</h1>
        <p className="text-[#869397]">Chào mừng trở lại! Tiếp tục hành trình nâng cấp kỹ năng của bạn.</p>
      </header>

      {/* Khu vực hiển thị Progress Bar (Nhiệm vụ của bạn) */}
      <section className="mb-12 max-w-4xl">
        {isLoading ? (
          <div className="h-32 bg-[#222a3d] animate-pulse rounded-2xl border border-[#171f33]"></div>
        ) : (
          progress && <ProgressBar completed={progress.completedSkills} total={progress.totalSkills} />
        )}
      </section>

      {/* Khu vực chờ lắp ghép Component của Dev C */}
      <section className="max-w-4xl">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black tracking-tight">Kỹ năng tiếp theo</h3>
        </div>

        <div className="p-8 bg-[#222a3d] border border-[#171f33] rounded-2xl text-center text-[#869397] border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-50">extension</span>
          <p>Khu vực này sẽ hiển thị danh sách kỹ năng (SkillList) do Dev C phụ trách.</p>
        </div>
      </section>
    </div>
  );
};