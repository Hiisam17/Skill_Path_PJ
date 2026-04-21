import { Handle, Position, type NodeProps } from 'reactflow';

export default function SectionNode({ data }: NodeProps) {
  const nodeName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');
  
  // Progress data injected from layout
  const completedCount = (data as any).completedCount ?? 0;
  const totalCount = (data as any).totalCount ?? 0;
  const hasProgress = totalCount > 0;
  const progressPct = hasProgress ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full min-h-full bg-[#0b1326]/90 border border-[#4cd7f6]/40 rounded-xl shadow-[0_0_15px_rgba(76,215,246,0.15)] flex flex-col items-center justify-center py-4 px-3 text-[#dae2fd] cursor-pointer hover:bg-[#131b2e] hover:border-[#4cd7f6] hover:shadow-[0_0_30px_rgba(76,215,246,0.35)] hover:scale-[1.03] backdrop-blur-md transition-all duration-300 relative overflow-hidden group">
      
      {/* Progress bar at bottom of node */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#171f33]">
          <div 
            className="h-full bg-[#4cd7f6] transition-all duration-500 rounded-r-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-[#4cd7f6] border-none shadow-[0_0_8px_#4cd7f6]" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-[#4cd7f6] border-none shadow-[0_0_8px_#4cd7f6]" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-[#4cd7f6] border-none shadow-[0_0_8px_#4cd7f6]" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-[#4cd7f6] border-none shadow-[0_0_8px_#4cd7f6]" />
      
      <div className="font-bold text-center px-2 text-lg uppercase tracking-wider group-hover:text-white transition-colors">
        {nodeName}
      </div>

    </div>
  );
}