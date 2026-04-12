import { type Edge } from 'reactflow';
import type { RoadmapNode } from '../types/roadmap';

const SECTION_W = 250;
const SECTION_H = 80;
const MIN_SKILL_W = 180;  // Chiều rộng tối thiểu của Skill
const MAX_SKILL_W = 350;  // Giới hạn chiều rộng tối đa kẻo bị tràn
const SKILL_H = 45;
const SKILL_GAP_Y = 15;
const GAP_X = 80;         // Khoảng cách ngang giữa Section và cột Skill
const ROW_MARGIN = 60;    // Khoảng cách dọc giữa các hàng

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

    // 1. TÍNH TOÁN CHIỀU RỘNG DỰA THEO CHỮ DÀI NHẤT
    // 1. TÍNH TOÁN CHIỀU RỘNG DỰA THEO CHỮ DÀI NHẤT
    let maxTextLen = 0;
    relatedSkills.forEach(s => {
      // Ép kiểu (as any) để TS không báo lỗi. 
      // Đồng thời tự động quét các trường label, title, hoặc name xem bạn đang dùng cái nào.
      const text = String((s.data as any).label || (s.data as any).title || (s.data as any).name || '');
      const len = text.length;
      if (len > maxTextLen) maxTextLen = len;
    });
    // Tính chiều rộng (Mỗi ký tự ~8px + 40px lề)
    const currentSkillW = skillCount > 0 
      ? Math.max(MIN_SKILL_W, Math.min(MAX_SKILL_W, 40 + maxTextLen * 8)) 
      : 0;

    // 2. TÍNH TOÁN CHIỀU CAO VÀ ĐIỂM CĂN GIỮA (CENTER Y)
    const skillBlockH = skillCount > 0 ? (skillCount * SKILL_H) + ((skillCount - 1) * SKILL_GAP_Y) : 0;
    const rowH = Math.max(SECTION_H, skillBlockH); // Lấy cục nào cao hơn làm chuẩn
    const centerY = currentY + rowH / 2; // TRỤC GIỮA CHUẨN XÁC

    // 3. XẾP TỌA ĐỘ CHO SECTION (Căn giữa theo centerY)
    const sectionX = CENTER_X - (SECTION_W / 2);
    const sectionY = centerY - (SECTION_H / 2);
    const isLeftSide = index % 2 === 0; // Chẵn Trái, Lẻ Phải

    layoutedNodes.push({
      ...section,
      position: { x: sectionX, y: sectionY },
      style: { width: SECTION_W, height: SECTION_H } // Bơm kích thước thẳng vào UI
    });

    // 4. XẾP TỌA ĐỘ CHO SKILL BLOCK (Cũng căn giữa theo centerY)
    if (skillCount > 0) {
      const skillX = isLeftSide 
        ? sectionX - GAP_X - currentSkillW 
        : sectionX + SECTION_W + GAP_X;

      let currentSkillY = centerY - (skillBlockH / 2); // Bắt đầu từ đỉnh của Block đã được căn giữa

      relatedSkills.forEach(skill => {
        layoutedNodes.push({
          ...skill,
          position: { x: skillX, y: currentSkillY },
          style: { width: currentSkillW, height: SKILL_H } // Bơm chiều rộng động vào UI
        });
        currentSkillY += SKILL_H + SKILL_GAP_Y;
      });
    }

    // Xuống dòng cho cụm tiếp theo
    currentY += rowH + ROW_MARGIN;
  });

  // 5. PHÂN LUỒNG MŨI TÊN (CỰC KỲ QUAN TRỌNG ĐỂ KHÔNG BỊ ĐÈ DÂY)
  const styledEdges = edges.map((edge, idx) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const isSecToSec = sourceNode?.type === 'sectionNode' && targetNode?.type === 'sectionNode';

    if (isSecToSec) {
      // Nối dọc: Đáy thằng trên -> Đỉnh thằng dưới
      return {
        ...edge,
        type: 'step',
        sourceHandle: 'bottom',
        targetHandle: 'top',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: Math.max(2, 6 - idx) }
      };
    } else {
      // Nối ngang (Tỏa tia): Hông thằng Section -> Hông thằng Skill
      const sectionIndex = sectionNodes.findIndex(n => n.id === edge.source);
      const isSkillOnLeft = sectionIndex % 2 === 0;

      return {
        ...edge,
        type: 'smoothstep',
        // Nếu Skill bên trái -> Bắn dây từ cổng 'left' của Section vào cổng 'right' của Skill
        sourceHandle: isSkillOnLeft ? 'left' : 'right',
        targetHandle: isSkillOnLeft ? 'right' : 'left',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }
      };
    }
  });

  return { nodes: layoutedNodes, edges: styledEdges };
};