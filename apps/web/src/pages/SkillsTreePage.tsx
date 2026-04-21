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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  
  const [activeJobInfo, setActiveJobInfo] = useState<{title: string, company: string} | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [lastVisitedNodeId, setLastVisitedNodeId] = useState<string | null>(null);
  const [roadmapTitle, setRoadmapTitle] = useState<string>('');

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<RoadmapFlowResponse>(`/roadmaps/${roadmapId}/flow`);
        if (data.title) setRoadmapTitle(data.title);

        const sidebarWidth = window.innerWidth > 960 ? 260 : 0;
        const availableWidth = window.innerWidth - sidebarWidth;
        const calculatedWidth = availableWidth;

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          data.nodes,
          data.edges,
          calculatedWidth
        );

        // (Optional: use calculatedWidth or totalWidth for canvas sizing if needed later)

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

        // Inject progress counts into section nodes (#4)
        const nodesWithProgress = nodesWithHighlights.map((n: any) => {
          if (n.type !== 'sectionNode') return n;
          
          // Find skill nodes connected to this section
          const connectedSkillIds = layoutedEdges
            .filter((e: any) => e.source === n.id)
            .map((e: any) => e.target);
          
          const connectedSkills = nodesWithHighlights.filter(
            (s: any) => s.type === 'skillNode' && connectedSkillIds.includes(s.id)
          );
          
          const totalCount = connectedSkills.length;
          const completedCount = connectedSkills.filter(
            (s: any) => !!(s.data as any)?.isCompleted
          ).length;
          
          return {
            ...n,
            data: { ...n.data, completedCount, totalCount },
          };
        });

        setNodes(nodesWithProgress as RoadmapNode[]);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roadmapId) loadRoadmap();
  }, [roadmapId, setNodes, setEdges]);

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

  // #5: Edge highlighting on node hover
  const onNodeMouseEnter = useCallback((_event: React.MouseEvent, node: Node) => {
    setEdges((eds) =>
      eds.map((e) => {
        const isConnected = e.source === node.id || e.target === node.id;
        if (isConnected) {
          return {
            ...e,
            style: {
              ...e.style,
              stroke: '#4cd7f6',
              strokeWidth: 3,
              strokeDasharray: undefined,
              filter: 'drop-shadow(0 0 6px rgba(76,215,246,0.6))',
            },
            animated: true,
          };
        }
        return e;
      })
    );
  }, [setEdges]);

  const onNodeMouseLeave = useCallback((_event: React.MouseEvent, _node: Node) => {
    // Restore edges to their original style
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: '#4cd7f6',
          strokeWidth: 2,
          strokeDasharray: e.type === 'step' ? undefined : '4 4',
          filter: undefined,
        },
        animated: e.type !== 'step',
      }))
    );
  }, [setEdges]);

  const handleResetGap = () => {
    localStorage.removeItem('activeGapAnalysis');
    setActiveJobInfo(null);
    navigate('/job-market');
  };

  const handleCloseGap = () => {
    setActiveJobInfo(null);
    localStorage.removeItem('activeGapAnalysis');
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: false,
        },
      }))
    );
  };

  // Loading UI
  if (loading) return (
    <div className="w-full h-full flex justify-center items-center bg-[#0b1326] text-[#dae2fd] font-bold text-xl tracking-widest uppercase">
      Đang tải bản đồ...
    </div>
  );

  return (
    // 4. THAY ĐỔI QUAN TRỌNG: h-screen -> h-full
    <div className="flex flex-col h-full w-full bg-[#0b1326] items-center justify-start relative">
      
      {/* Title Overlay */}
      {roadmapTitle && (
        <div className="absolute top-6 left-6 z-[100] bg-[#131b2e]/80 border border-[#3d494c]/50 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
          <h1 className="text-[#4cd7f6] font-bold text-xl tracking-wide uppercase">
            {roadmapTitle}
          </h1>
        </div>
      )}

      <main
        className="relative h-full w-full overflow-hidden bg-[#0b1326]"
      >
        <ReactFlow
          onInit={setRfInstance}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          panOnDrag={false}
          nodesDraggable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          preventScrolling={false}
          panOnScrollMode={PanOnScrollMode.Vertical}
          translateExtent={[[-Infinity, -100], [Infinity, Infinity]]}
          defaultViewport={{ x: 0, y: 50, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
        >
          <Background color="#3d494c" gap={24} size={1.5} />
        </ReactFlow>
      </main>

      {activeJobInfo && !isDrawerOpen && (
        <div className="absolute top-4 right-4 bg-slate-900 bg-opacity-90 border border-blue-500/50 p-4 rounded-lg shadow-xl text-slate-200 z-[1000] w-80 max-w-[90vw]">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Skill Gap Analysis</h3>
            <button 
              onClick={handleCloseGap}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
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
                const highlightedNodes = nodes.filter(n => n.data && (n.data as any).isHighlighted);
                if (highlightedNodes.length > 0 && rfInstance) {
                  let nextIndex = 0;
                  if (lastVisitedNodeId) {
                    const currentIndex = highlightedNodes.findIndex(n => n.id === lastVisitedNodeId);
                    if (currentIndex !== -1) {
                      nextIndex = (currentIndex + 1) % highlightedNodes.length;
                    }
                  }
                  
                  const targetNode = highlightedNodes[nextIndex];
                  
                  // Mẹo: Giữ nguyên trục X ở chính giữa màn hình (dựa vào sectionNode)
                  // Để ngăn không cho cả roadmap bị lệch sang trái/phải vĩnh viễn
                  const sectionNode = nodes.find(n => n.type === 'sectionNode');
                  // Kích thước của sectionNode trong layout.ts là 250px
                  const centerX = sectionNode ? sectionNode.position.x + 125 : targetNode.position.x;
                  
                  rfInstance.setCenter(centerX, targetNode.position.y, { zoom: 1, duration: 800 });
                  setLastVisitedNodeId(targetNode.id);
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              {(() => {
                const highlightedNodes = nodes.filter(n => n.data && (n.data as any).isHighlighted);
                if (highlightedNodes.length <= 1) return 'Tìm Skills';
                
                let currentIndex = highlightedNodes.findIndex(n => n.id === lastVisitedNodeId);
                // Nếu chưa tìm thấy (mới click lần đầu) thì hiển thị là đang chuẩn bị tìm skill số 1
                let displayIndex = currentIndex === -1 ? 0 : currentIndex;
                
                return `Tìm Skills (${displayIndex + 1}/${highlightedNodes.length})`;
              })()}
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

