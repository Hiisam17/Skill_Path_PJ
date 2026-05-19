import { useMemo } from 'react';
import type { Node } from 'reactflow';
import {
  BookOpen,
  GitBranch,
  Infinity as InfinityIcon,
  Layers,
  Sparkles,
  Star,
  Trophy,
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

type LegendItemConfig = {
  icon: LucideIcon;
  label: string;
  iconClassName: string;
  labelClassName: string;
};

const LABEL_TYPE_UI: Record<VisibleLabelType, LegendItemConfig> = {
  RECOMMENDED: {
    icon: Star,
    label: 'Khuyên dùng',
    iconClassName: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] fill-purple-400/20',
    labelClassName: 'text-purple-400',
  },
  ALTERNATIVE: {
    icon: GitBranch,
    label: 'Lựa chọn thay thế',
    iconClassName: 'text-teal-600',
    labelClassName: 'text-teal-600',
  },
  ANYTIME: {
    icon: InfinityIcon,
    label: 'Học bất cứ lúc nào',
    iconClassName: 'text-neutral-500 opacity-80',
    labelClassName: 'text-neutral-500 opacity-80',
  },
  BEGINNER: {
    icon: BookOpen,
    label: 'Beginner',
    iconClassName: 'text-emerald-400',
    labelClassName: 'text-emerald-400',
  },
  INTERMEDIATE: {
    icon: Layers,
    label: 'Intermediate',
    iconClassName: 'text-amber-400',
    labelClassName: 'text-amber-400',
  },
  ADVANCED: {
    icon: Trophy,
    label: 'Advanced',
    iconClassName: 'text-rose-400',
    labelClassName: 'text-rose-400',
  },
  OPTIONAL: {
    icon: Sparkles,
    label: 'Tùy chọn',
    iconClassName: 'text-sky-400',
    labelClassName: 'text-sky-400',
  },
};

const isVisibleLabelType = (labelType: unknown): labelType is VisibleLabelType =>
  typeof labelType === 'string' && labelType !== 'STANDARD' && labelType in LABEL_TYPE_UI;

type RoadmapLegendProps = {
  nodes: Node[];
};

export default function RoadmapLegend({ nodes }: RoadmapLegendProps) {
  const uniqueLabelTypes = useMemo(
    () =>
      Array.from(
        new Set(
          nodes
            .map((node) => node.data?.labelType)
            .filter(isVisibleLabelType)
        )
      ),
    [nodes]
  );

  if (uniqueLabelTypes.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 z-[100] flex flex-col gap-3 p-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl shadow-lg min-w-[200px]">
      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Chú giải Roadmap</h4>

      {uniqueLabelTypes.map((labelType) => {
        const legendItem = LABEL_TYPE_UI[labelType];
        const Icon = legendItem.icon;

        return (
          <div key={labelType} className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center bg-neutral-900 rounded-full border border-neutral-700/50">
              <Icon className={`w-3.5 h-3.5 ${legendItem.iconClassName}`} />
            </div>
            <span className={`text-sm font-medium ${legendItem.labelClassName}`}>
              {legendItem.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
