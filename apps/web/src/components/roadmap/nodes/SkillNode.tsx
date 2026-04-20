import { Handle, Position, type NodeProps } from 'reactflow';

export default function SkillNode({ data }: NodeProps) {
  const nodeName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');
  const isCompleted = !!(data as any).isCompleted;

  // 1. BASE: Phong cách Brutalism - Viền dày, chữ in hoa đậm, layout linh hoạt
  const baseClasses = "w-full h-full border-4 flex items-center justify-center px-6 py-3 cursor-pointer transition-all duration-300 relative font-black uppercase text-center min-w-[150px]";
  
// 2. DEFAULT
  let stateClasses = "bg-slate-900 text-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1";

  // 3. COMPLETED
  if (isCompleted) {
    stateClasses = "bg-slate-900 text-white border-[#3b82f6] shadow-[4px_4px_0px_#3b82f6] hover:-translate-y-1";
  } else if ((data as any).isHighlighted) {
    stateClasses = "bg-yellow-400 text-black border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 animate-pulse";
  }

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      
      {/* Cọc nối bên Trái (Target) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left" 
        // Đổi màu cọc nối thành xanh nếu đã hoàn thành, vuông vức không bo góc
        className={`w-3 h-3 border-2 rounded-none -left-[8px] ${isCompleted ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-white border-black'}`} 
      />
      
      {/* Nội dung Node */}
      <div className="font-medium text-center text-sm break-words flex items-center gap-2">
        {isCompleted && (
          // Icon SVG cũng được chuyển sang màu xanh dương cho tông xuyệt tông
          <svg className="w-5 h-5 flex-shrink-0 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span>{nodeName}</span>
      </div>

      {/* Cọc nối bên Phải (Source) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right" 
        // Đổi màu cọc nối tương tự
        className={`w-3 h-3 border-2 rounded-none -right-[8px] ${isCompleted ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-black border-black'}`} 
      />
      
    </div>
  );
}