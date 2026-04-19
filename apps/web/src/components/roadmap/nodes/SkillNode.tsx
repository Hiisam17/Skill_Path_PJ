import { Handle, Position, type NodeProps } from 'reactflow';

export default function SkillNode({ data }: NodeProps) {
  const nodeName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');

  return (
    <div className="w-full h-full bg-slate-800 border-2 border-slate-600 rounded-md flex items-center justify-center p-2 text-slate-300 cursor-pointer hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-colors hover:border-blue-400 hover:text-white">
      
      <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-slate-500 border-none" />
      <Handle type="target" position={Position.Right} id="right" className="w-2 h-2 !bg-slate-500 border-none" />
      
      <div className="font-medium text-center text-sm break-words">
        {nodeName}
      </div>
    </div>
  );
}