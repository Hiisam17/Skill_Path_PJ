// src/types/roadmap.ts
import type { Node, Edge } from 'reactflow';

export interface SectionNodeData {
    label: string;
    sortOrder: number;
}

export interface SkillNodeData {
    name: string;
    nodeId?: string | null;
    isOptional: boolean;
    isLeft?: boolean;
    skillId?: number;
    roadmapSkillId?: number;
    labelType?: string;
    isCompleted?: boolean;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    statusId?: number | null;
    isHighlighted?: boolean;
}

export type RoadmapData = SectionNodeData | SkillNodeData;

export type RoadmapNode = Node<RoadmapData>;

export interface RoadmapFlowResponse {
    title?: string;
    nodes: RoadmapNode[];
    edges: Edge[];
}
