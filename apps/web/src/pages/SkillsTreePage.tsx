import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, PanOnScrollMode, type NodeTypes, type Node } from 'reactflow';
import { useParams } from 'react-router-dom';
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
  
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(900);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

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

        setNodes(layoutedNodes as RoadmapNode[]);
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

  // Sửa loading UI một chút cho đẹp
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