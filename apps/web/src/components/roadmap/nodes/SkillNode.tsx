import { Handle, Position, type NodeProps } from 'reactflow';
import { CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

/** Capitalize first letter of each word */
const titleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export default function SkillNode({ data }: NodeProps) {
  const rawName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');
  const nodeName = titleCase(rawName);
  const statusId = (data as any).statusId;
  const isCompleted = statusId === 1 || !!(data as any).isCompleted;
  const isInProgress = statusId === 2;
  const isSkipped = statusId === 3;
  const isLeft = !!(data as any).isLeft;
  const isHighlighted = !!(data as any).isHighlighted;

  // BASE GLASSMORPHISM
  const baseClasses = "w-full h-full flex items-center justify-center px-4 py-3 cursor-pointer transition-all duration-500 relative text-center min-w-[160px] rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98]";
  
  // DEFAULT
  let stateClasses = "text-slate-400 font-medium";

  // STATUS COLORS & ICONS
  let Icon = null;
  
  if (isCompleted) {
    stateClasses = "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold";
    Icon = CheckCircle2;
  } else if (isInProgress) {
    stateClasses = "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold";
    Icon = Clock;
  } else if (isSkipped) {
    stateClasses = "border-white/5 bg-transparent text-slate-600 opacity-40 italic grayscale shadow-none hover:shadow-none cursor-not-allowed";
    Icon = XCircle;
  } else if (isHighlighted) {
    stateClasses = "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse font-bold";
    Icon = Search;
  }

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      
      {/* Handle facing the Section */}
      {isLeft ? (
        <Handle 
          type="target" 
          position={Position.Right} 
          id="right" 
          className={`w-2.5 h-2.5 rounded-full border border-white/20 -right-[6px] transition-colors ${isCompleted ? 'bg-cyan-400' : 'bg-slate-700'}`}
        />
      ) : (
        <Handle 
          type="target" 
          position={Position.Left} 
          id="left" 
          className={`w-2.5 h-2.5 rounded-full border border-white/20 -left-[6px] transition-colors ${isCompleted ? 'bg-cyan-400' : 'bg-slate-700'}`}
        />
      )}
      
      {/* Content */}
      <div className="text-sm break-words flex items-center gap-2 w-full justify-center px-1">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${isInProgress ? 'animate-spin-slow' : ''}`} />}
        <span className="leading-tight">{nodeName}</span>
      </div>
      
    </div>
  );
}
