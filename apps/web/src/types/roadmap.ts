// src/types/roadmap.ts
import type { Node, Edge } from 'reactflow';

export interface SectionNodeData {
    label: string;
    sortOrder: number;
}

export interface SkillNodeData {
    name: string;
    isOptional: boolean;
}

export type RoadmapData = SectionNodeData | SkillNodeData;

export type RoadmapNode = Node<RoadmapData>;

export interface RoadmapFlowResponse {
    nodes: RoadmapNode[];
    edges: Edge[];
}