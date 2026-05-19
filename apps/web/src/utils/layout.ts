import { type Edge, MarkerType } from 'reactflow';
import type { RoadmapNode } from '../types/roadmap';

const SECTION_W = 250;
const SECTION_H = 80;
const MIN_SKILL_W = 180;  // Chiều rộng tối thiểu của Skill
const MAX_SKILL_W = 350;  // Giới hạn chiều rộng tối đa kẻo bị tràn
const SKILL_H = 50;
const SKILL_GAP_Y = 15;
const GAP_X = 80;
const ROW_MARGIN = 60;
const PADDING = 20; // Padding from canvas edges

/**
 * Calculates positioned layout for roadmap nodes in an alternating left/right pattern.
 * Section nodes are centered; skill nodes branch to alternating sides.
 * Returns nodes, edges, and the actual total width needed by the layout.
 */
export const getLayoutedElements = (nodes: RoadmapNode[], edges: Edge[], canvasWidth: number) => {
  const CENTER_X = canvasWidth / 2;
  
  const sectionNodes = nodes.filter(n => n.type === 'sectionNode');
  const skillNodes = nodes.filter(n => n.type === 'skillNode');
  
  const layoutedNodes: RoadmapNode[] = [];
  let currentY = 50; 

  sectionNodes.forEach((section, index) => {
    const relatedSkills = edges
      .filter(e => e.source === section.id)
      .map(e => skillNodes.find(s => s.id === e.target))
      .filter(Boolean) as RoadmapNode[];

    const skillCount = relatedSkills.length;

    // Calculate dynamic width based on longest skill label text.
    let maxTextLen = 0;
    relatedSkills.forEach(s => {
      // NOTE: Uses type assertion since node data shape varies between skill types.
      const text = String((s.data as any).label || (s.data as any).title || (s.data as any).name || '');
      const len = text.length;
      if (len > maxTextLen) maxTextLen = len;
    });
    // Approximate width: ~9px per character + 60px padding.
    const currentSkillW = skillCount > 0 
      ? Math.max(MIN_SKILL_W, Math.min(MAX_SKILL_W, 60 + maxTextLen * 9)) 
      : 0;

    // Calculate vertical center for aligning section and skill blocks.
    const skillBlockH = skillCount > 0 ? (skillCount * SKILL_H) + ((skillCount - 1) * SKILL_GAP_Y) : 0;
    const rowH = Math.max(SECTION_H, skillBlockH);
    const centerY = currentY + rowH / 2;

    const sectionX = CENTER_X - (SECTION_W / 2);
    const sectionY = centerY - (SECTION_H / 2);
    const isLeftSide = index % 2 === 0;

    layoutedNodes.push({
      ...section,
      position: { x: sectionX, y: sectionY },
      style: { width: SECTION_W, minHeight: SECTION_H }
    });

    if (skillCount > 0) {
      const skillX = isLeftSide 
        ? sectionX - GAP_X - currentSkillW 
        : sectionX + SECTION_W + GAP_X;

      let currentSkillY = centerY - (skillBlockH / 2);

      relatedSkills.forEach(skill => {
        layoutedNodes.push({
          ...skill,
          position: { x: skillX, y: currentSkillY },
          style: { width: currentSkillW, height: SKILL_H },
          data: { ...skill.data, isLeft: isLeftSide }
        });
        currentSkillY += SKILL_H + SKILL_GAP_Y;
      });
    }

    currentY += rowH + ROW_MARGIN;
  });

  // --- Post-layout: Shift all nodes so none have negative X positions ---
  let minX = Infinity;
  let maxX = -Infinity;
  layoutedNodes.forEach(n => {
    const x = n.position.x;
    const w = (n.style?.width as number) || 0;
    if (x < minX) minX = x;
    if (x + w > maxX) maxX = x + w;
  });

  // If any node extends past the left edge, shift everything right
  const shiftX = minX < PADDING ? (PADDING - minX) : 0;
  if (shiftX > 0) {
    layoutedNodes.forEach(n => {
      n.position = { ...n.position, x: n.position.x + shiftX };
    });
  }

  // Calculate the actual total width the layout needs
  const totalWidth = (maxX + shiftX) + PADDING;

  // Route edges between nodes with appropriate direction and styling.
  const styledEdges = edges.map((edge, idx) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const isSecToSec = sourceNode?.type === 'sectionNode' && targetNode?.type === 'sectionNode';

    if (isSecToSec) {
      return {
        ...edge,
        type: 'step',
        sourceHandle: 'bottom',
        targetHandle: 'top',
        animated: false,
        style: { stroke: '#4cd7f6', strokeWidth: Math.max(2, 6 - idx) },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#4cd7f6',
        },
      };
    } else {
      const sectionIndex = sectionNodes.findIndex(n => n.id === edge.source);
      const isSkillOnLeft = sectionIndex % 2 === 0;

      return {
        ...edge,
        type: 'smoothstep',
        sourceHandle: isSkillOnLeft ? 'left' : 'right',
        targetHandle: isSkillOnLeft ? 'right' : 'left',
        animated: true,
        style: { stroke: '#4cd7f6', strokeWidth: 2, strokeDasharray: '4 4' }
      };
    }
  });

  return { nodes: layoutedNodes, edges: styledEdges, totalWidth };
};