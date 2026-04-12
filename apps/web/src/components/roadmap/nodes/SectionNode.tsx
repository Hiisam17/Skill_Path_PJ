import { Handle, Position, type NodeProps } from 'reactflow';

export default function SectionNode({ data }: NodeProps) {
  // Trích xuất tên tự động (phòng trường hợp API dùng tên trường khác nhau)
  const nodeName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');

  return (
    // Đổi màu vàng thành nền Slate tối, viền Xanh dương phát sáng nhẹ
    <div className="w-full h-full bg-slate-900 border-2 border-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center p-2 text-white">
      
      <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-blue-400 border-none" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-blue-400 border-none" />
      <Handle type="source" position={Position.Left} id="left" className="w-2 h-2 !bg-blue-400 border-none" />
      <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-blue-400 border-none" />
      
      <div className="font-bold text-center px-2 text-lg">
        {nodeName}
      </div>
    </div>
  );
}