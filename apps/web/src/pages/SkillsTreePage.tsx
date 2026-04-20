import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, PanOnScrollMode, type NodeTypes, type Node } from 'reactflow';
import { useParams, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';

import apiClient from '@/lib/axios';
import { getLayoutedElements } from '@/utils/layout';
import SectionNode from '@/components/roadmap/nodes/SectionNode';
import SkillNode from '@/components/roadmap/nodes/SkillNode';
import type { RoadmapFlowResponse, RoadmapData, RoadmapNode } from '@/types/roadmap';

import { ResourceDrawer } from '@/components/roadmap/ResourceDrawer';

const nodeTypes: NodeTypes = {
  sectionNode: SectionNode,
  skillNode: SkillNode,
};

export default function SkillsTreePage() {
  // 1. SỬA LẠI TÊN PARAM CHO KHỚP VỚI App.tsx
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(900);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  
  const [activeJobInfo, setActiveJobInfo] = useState<{title: string, company: string} | null>(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        // 2. Dùng biến roadmapId để gọi API
        const { data } = await apiClient.get<RoadmapFlowResponse>(`/roadmaps/${roadmapId}/flow`);

        const screenWidth = window.innerWidth;
        const calculatedWidth = Math.max(700, Math.min(1200, screenWidth * 0.5));
        setContainerWidth(calculatedWidth);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          data.nodes,
          data.edges,
          calculatedWidth
        );

        // -- Add JD Highlighting --
        let gapNodesList: string[] = [];
        try {
          const stored = localStorage.getItem("activeGapAnalysis");
          if (stored) {
            const parsed = JSON.parse(stored);
            setActiveJobInfo({ title: parsed.jobTitle, company: parsed.companyName });
            if (Array.isArray(parsed.gapNodes)) {
              gapNodesList = parsed.gapNodes;
            }
          }
        } catch (e) {
          console.error("Failed to parse activeGapAnalysis", e);
        }

        const nodesWithHighlights = layoutedNodes.map((n: any) => {
          const matched = n.data?.name && gapNodesList.some(gap => gap.toLowerCase() === n.data.name.toLowerCase());
          if (n.type === "skillNode" && matched) {
            return {
              ...n,
              data: { ...n.data, isHighlighted: true },
            };
          }
          return n;
        });

        setNodes(nodesWithHighlights as RoadmapNode[]);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId) loadRoadmap();
  }, [roadmapId, setNodes, setEdges]); // Cập nhật dependency array

  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    event.preventDefault();

    setIsDrawerOpen(true);
    setIsDrawerLoading(true);

    try {
      const isSection = node.type === 'sectionNode';
      const rawId = (node.data as any)?.id || (node.data as any)?.skillId || node.id;

      if (!rawId) throw new Error('Node ID not found');

      const numericId = String(rawId).replace(/[^0-9]/g, '');

      if (!isSection) {
        setSelectedSkillId(Number(numericId));
      } else {
        setSelectedSkillId(null);
      }

      const endpoint = isSection
        ? `/roadmap-sections/${numericId}/detail`
        : `/roadmaps/${numericId}/detail`;

      const response = await apiClient.get(endpoint);
      console.log('Detail data from backend:', response.data);
      setDrawerData(response.data);
    } catch (error) {
      console.error('Failed to fetch node detail:', error);
    } finally {
      setIsDrawerLoading(false);
    }
  }, []);

  const handleSkillCompleted = useCallback((skillId: number) => {
    console.log("🛑 6. Component cha đã nhận được ID cần đổi màu:", skillId);
    setNodes((nds) =>
      nds.map((node) => {
        if (
          node.type === 'skillNode' &&
          ((node.data as any)?.skillId === skillId || (node.data as any)?.id === skillId || node.id === String(skillId))
        ) {
          return {
            ...node,
            data: {
              ...node.data,
              isCompleted: true,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleResetGap = () => {
    localStorage.removeItem('activeGapAnalysis');
    setActiveJobInfo(null);
    navigate('/job-market');
  };

  // Sa loading UI một chút cho đẹp
  if (loading) return (
    <div className="w-full h-full flex justify-center items-center bg-slate-950 text-white font-bold text-xl tracking-widest uppercase">
      Đang tải bản đồ...
    </div>
  );

  return (
    // 4. THAY ĐỔI QUAN TRỌNG: h-screen -> h-full
    <div className="flex flex-col h-full w-full bg-slate-950 items-center justify-center relative">
      <main
        className="relative h-full overflow-hidden bg-slate-950"
        style={{ width: `${containerWidth}px` }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          panOnDrag={false}
          nodesDraggable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          preventScrolling={false}
          panOnScrollMode={PanOnScrollMode.Vertical}
          translateExtent={[[0, -Infinity], [containerWidth, Infinity]]}
          defaultViewport={{ x: 0, y: 50, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
        >
          <Background color="#334155" gap={20} size={1.5} />
        </ReactFlow>
      </main>

      {activeJobInfo && (
        <div className="absolute top-4 right-4 bg-slate-900 bg-opacity-90 border border-blue-500/50 p-4 rounded-lg shadow-xl text-slate-200 z-[1000] w-80 max-w-[90vw]">
          <h3 className="text-sm font-semibold text-blue-400 mb-1 uppercase tracking-wider">Skill Gap Analysis</h3>
          <p className="text-base font-bold text-white leading-tight">{activeJobInfo.title}</p>
          <p className="text-sm text-slate-400 mb-3">{activeJobInfo.company}</p>
          <div className="flex gap-2">
            <button 
              onClick={handleResetGap}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 px-3 rounded border border-slate-600 transition-colors"
            >
              Chọn Job Khác
            </button>
            <button
              onClick={() => {
                const els = document.querySelectorAll('.animate-pulse');
                if (els.length > 0) els[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              Tìm Skills
            </button>
          </div>
        </div>
      )}

      <ResourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={isDrawerLoading}
        data={drawerData}
        skillId={selectedSkillId}
        onCompleteSuccess={handleSkillCompleted}
      />
    </div>
  );
}

