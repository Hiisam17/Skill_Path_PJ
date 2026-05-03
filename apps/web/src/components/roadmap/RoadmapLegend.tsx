import { Star, GitBranch, Infinity as InfinityIcon } from 'lucide-react';

export default function RoadmapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[100] flex flex-col gap-3 p-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl shadow-lg min-w-[200px]">
      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Chú giải Roadmap</h4>
      
      {/* STANDARD */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center border border-white/20 rounded-md bg-white/5">
        </div>
        <span className="text-sm font-medium text-slate-400">Bắt buộc</span>
      </div>

      {/* RECOMMENDED */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-700/50">
          <Star className="w-3.5 h-3.5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] fill-purple-400/20" />
        </div>
        <span className="text-sm font-medium text-purple-400">Khuyên dùng</span>
      </div>

      {/* ALTERNATIVE */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-700/50">
          <GitBranch className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <span className="text-sm font-medium text-teal-600">Lựa chọn thay thế</span>
      </div>

      {/* ANYTIME */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-700/50">
          <InfinityIcon className="w-3.5 h-3.5 text-neutral-500 opacity-80" />
        </div>
        <span className="text-sm font-medium text-neutral-500 opacity-80">Học bất cứ lúc nào</span>
      </div>
    </div>
  );
}
