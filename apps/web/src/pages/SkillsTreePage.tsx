import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, PanOnScrollMode, type NodeTypes,type Node } from 'reactflow';
import { useParams } from 'react-router-dom';
import 'reactflow/dist/style.css';

import apiClient from '@/lib/axios';
import { getLayoutedElements } from '@/utils/layout';
import SectionNode from '@/components/roadmap/nodes/SectionNode';
import SkillNode from '@/components/roadmap/nodes/SkillNode';
import type { RoadmapFlowResponse, RoadmapData, RoadmapNode } from '@/types/roadmap';

// 1. IMPORT DRAWER VỪA TẠO
import { ResourceDrawer } from '@/components/roadmap/ResourceDrawer'; 

const nodeTypes: NodeTypes = {
  sectionNode: SectionNode,
  skillNode: SkillNode,
};

export default function SkillsTreePage() {
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(900);

  // 2. KHAI BÁO STATE CHO DRAWER
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<RoadmapFlowResponse>(`/roadmaps/${id}/flow`);

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
        console.error("Lỗi tải roadmap:", error);
      } finally {
        setLoading(false); 
      }
    };

    if (id) loadRoadmap();
  }, [id, setNodes, setEdges]);

  // 3. HÀM XỬ LÝ KHI CLICK VÀO NODE BẤT KỲ TRÊN BẢN ĐỒ
const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
  event.preventDefault();

  setIsDrawerOpen(true);
  setIsDrawerLoading(true);

  try {
    const isSection = node.type === 'sectionNode';
    
    const rawId = node.data?.id || node.data?.skillId || node.id; 
    
    if (!rawId) throw new Error("Không tìm thấy ID của node");

    const numericId = String(rawId).replace(/[^0-9]/g, ''); 

    const endpoint = isSection 
      ? `/roadmap-sections/${numericId}/detail` 
      : `/roadmaps/${numericId}/detail`; 
      
    const response = await apiClient.get(endpoint);
    console.log("👉 Dữ liệu gốc từ BE:", response.data);
    setDrawerData(response.data);
  } catch (error) {
    console.error("🚨 Lỗi khi lấy chi tiết node:", error);
  } finally {
    setIsDrawerLoading(false);
  }
}, []);

  if (loading) return <div className="p-10 text-white flex justify-center items-center h-screen">Đang tải dữ liệu bản đồ...</div>;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 items-center justify-center relative">
      
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
          
          // 4. GẮN SỰ KIỆN CLICK VÀO ĐÂY LÀ XONG!
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

      {/* 5. GẮN COMPONENT DRAWER NGOÀI CÙNG MAIN ĐỂ NÓ ĐÈ LÊN MỌI THỨ */}
      <ResourceDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoading={isDrawerLoading}
        data={drawerData}
      />
      
    </div>
  );
}