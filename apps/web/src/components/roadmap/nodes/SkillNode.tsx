import { Handle, Position, type NodeProps } from 'reactflow';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  GitBranch,
  Infinity as InfinityIcon,
  Layers,
  Search,
  Sparkles,
  Star,
  Trophy,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

type LabelType =
  | 'RECOMMENDED'
  | 'ALTERNATIVE'
  | 'ANYTIME'
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'OPTIONAL'
  | 'STANDARD';

type VisibleLabelType = Exclude<LabelType, 'STANDARD'>;

type LabelTypeConfig = {
  icon: LucideIcon;
  title: string;
  iconClassName: string;
  borderStyleClass?: string;
  opacityClass?: string;
};

const LABEL_TYPE_UI: Record<VisibleLabelType, LabelTypeConfig> = {
  RECOMMENDED: {
    icon: Star,
    title: 'Khuyên dùng',
    iconClassName: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] fill-purple-400/20',
  },
  ALTERNATIVE: {
    icon: GitBranch,
    title: 'Lựa chọn thay thế',
    iconClassName: 'text-teal-600',
    borderStyleClass: 'border-dashed',
  },
  ANYTIME: {
    icon: InfinityIcon,
    title: 'Học bất cứ lúc nào',
    iconClassName: 'text-neutral-500 opacity-80',
    borderStyleClass: 'border-dashed',
    opacityClass: 'opacity-75',
  },
  BEGINNER: {
    icon: BookOpen,
    title: 'Beginner',
    iconClassName: 'text-emerald-400',
  },
  INTERMEDIATE: {
    icon: Layers,
    title: 'Intermediate',
    iconClassName: 'text-amber-400',
  },
  ADVANCED: {
    icon: Trophy,
    title: 'Advanced',
    iconClassName: 'text-rose-400',
  },
  OPTIONAL: {
    icon: Sparkles,
    title: 'Tùy chọn',
    iconClassName: 'text-sky-400',
    borderStyleClass: 'border-dashed',
  },
};

const isVisibleLabelType = (labelType: unknown): labelType is VisibleLabelType =>
  typeof labelType === 'string' && labelType !== 'STANDARD' && labelType in LABEL_TYPE_UI;

/** Capitalize first letter of each word */
const titleCase = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export default function SkillNode({ data }: NodeProps) {
  const rawName = String((data as any).label || (data as any).title || (data as any).name || 'Unnamed');
  const nodeName = titleCase(rawName);
  const statusId = (data as any).statusId;
  const status = (data as any).status;
  const isCompleted = status === 'COMPLETED' || statusId === 1 || !!(data as any).isCompleted;
  const isInProgress = status === 'IN_PROGRESS' || statusId === 2;
  const isSkipped = status === 'SKIPPED' || statusId === 3;
  const isLeft = !!(data as any).isLeft;
  const isHighlighted = !!(data as any).isHighlighted;
  const labelType = (data as any).labelType;
  const labelTypeConfig = isVisibleLabelType(labelType) ? LABEL_TYPE_UI[labelType] : null;

  // Label Type logic
  const LabelIcon = labelTypeConfig?.icon;
  const labelIconClasses = labelTypeConfig?.iconClassName || '';
  const labelTitle = labelTypeConfig?.title || '';
  const borderStyleClass = labelTypeConfig?.borderStyleClass || 'border-solid';
  const opacityClass = labelTypeConfig?.opacityClass || 'opacity-100';

  // BASE GLASSMORPHISM
  const baseClasses = `w-full h-full flex items-center justify-center px-4 py-3 cursor-pointer transition-all duration-500 relative text-center min-w-[160px] rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-[0.98] ${borderStyleClass} ${opacityClass}`;
  
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
      
      {/* Label Icon at top right */}
      {LabelIcon && (
        <div 
          className="absolute -top-2 -right-2 bg-neutral-900 rounded-full p-1 border border-neutral-700/50 shadow-md"
          title={labelTitle}
        >
          <LabelIcon className={`w-3.5 h-3.5 ${labelIconClasses}`} />
        </div>
      )}

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
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="text-sm break-words flex items-center gap-2 w-full justify-center px-1">
          {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${isInProgress ? 'animate-spin-slow' : ''}`} />}
          <span className="leading-tight">{nodeName}</span>
        </div>
      </div>
      
    </div>
  );
}
