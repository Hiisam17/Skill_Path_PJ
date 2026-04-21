import { Handle, Position, type NodeProps } from 'reactflow';

/** Capitalize first letter of each word */
const titleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export default function SkillNode({ data }: NodeProps) {
  const rawName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');
  const nodeName = titleCase(rawName);
  const isCompleted = !!(data as any).isCompleted;
  const isLeft = !!(data as any).isLeft;

  // BASE
  const baseClasses = "w-full h-full flex items-center justify-center px-4 py-3 cursor-pointer transition-all duration-300 relative font-medium text-center min-w-[150px] rounded-xl border backdrop-blur-md";
  
  // DEFAULT
  let stateClasses = "bg-[#171f33]/90 text-[#bcc9cd] border-[#3d494c]/40 shadow-lg hover:border-[#4cd7f6]/50 hover:shadow-[0_4px_20px_rgba(76,215,246,0.15)] hover:-translate-y-1 hover:text-[#dae2fd]";

  // COMPLETED
  if (isCompleted) {
    stateClasses = "bg-[#131b2e] text-[#4cd7f6] border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.2)] font-bold hover:shadow-[0_0_25px_rgba(76,215,246,0.4)] hover:-translate-y-1";
  } else if ((data as any).isHighlighted) {
    stateClasses = "bg-[#171f33] text-[#ffb873] border-[#ffb873] shadow-[0_0_15px_rgba(255,184,115,0.3)] font-bold hover:-translate-y-1 animate-pulse";
  }

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      
      {/* Handle facing the Section */}
      {isLeft ? (
        <Handle 
          type="target" 
          position={Position.Right} 
          id="right" 
          className={`w-3 h-3 rounded-full border-2 -right-[7.5px] transition-colors ${isCompleted ? 'bg-[#4cd7f6] border-[#4cd7f6] shadow-[0_0_10px_#4cd7f6]' : 'bg-[#171f33] border-[#4cd7f6]/50'}`} 
        />
      ) : (
        <Handle 
          type="target" 
          position={Position.Left} 
          id="left" 
          className={`w-3 h-3 rounded-full border-2 -left-[7.5px] transition-colors ${isCompleted ? 'bg-[#4cd7f6] border-[#4cd7f6] shadow-[0_0_10px_#4cd7f6]' : 'bg-[#171f33] border-[#4cd7f6]/50'}`} 
        />
      )}
      
      {/* Content */}
      <div className="text-sm break-words flex items-center gap-2 w-full justify-center px-2">
        {isCompleted && (
          <svg className="w-4 h-4 flex-shrink-0 text-[#4cd7f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span>{nodeName}</span>
      </div>
      
    </div>
  );
}