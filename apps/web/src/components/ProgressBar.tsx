import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  // Tính phần trăm thực tế từ API
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-[#222a3d] rounded-2xl p-6 border border-[#171f33] shadow-lg relative overflow-hidden group">
      {/* Hiệu ứng Glow nền */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4cd7f6]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
      
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <p className="text-sm font-bold text-[#4cd7f6] tracking-widest uppercase mb-1">Lộ trình hiện tại</p>
          <h2 className="text-3xl font-black text-white tracking-tight">Fullstack Developer</h2>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-[#4cd7f6] group-hover:text-cyan-300 transition-colors">
            {percentage}%
          </span>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {completed}/{total} Kỹ năng đã đạt
          </p>
        </div>
      </div>
      
      {/* Thanh chạy tiến độ */}
      <div className="w-full bg-[#171f33] rounded-full h-3 overflow-hidden shadow-inner relative z-10">
        <div
          className="bg-gradient-to-r from-[#06b6d4] to-[#4cd7f6] h-3 rounded-full relative"
          style={{ width: `${percentage}%`, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {/* Hiệu ứng ánh sáng lướt trên thanh progress */}
          <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 blur-[2px]"></div>
        </div>
      </div>
    </div>
  );
};