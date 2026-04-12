import { useEffect, useState } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, PanOnScrollMode, type NodeTypes } from 'reactflow';
import { useParams } from 'react-router-dom';
import 'reactflow/dist/style.css';

import apiClient from '@/lib/axios';
import { getLayoutedElements } from '@/utils/layout';
import SectionNode from '@/components/roadmap/nodes/SectionNode';
import SkillNode from '@/components/roadmap/nodes/SkillNode';
import type { RoadmapFlowResponse, RoadmapData, RoadmapNode } from '@/types/roadmap';

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

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<RoadmapFlowResponse>(`/roadmaps/${id}/flow`);

        // 1. TÍNH TOÁN KÍCH THƯỚC KHUNG
        const screenWidth = window.innerWidth;
        const calculatedWidth = Math.max(700, Math.min(1200, screenWidth * 0.5));
        setContainerWidth(calculatedWidth);

        // 2. GỌI THUẬT TOÁN (Truyền trực tiếp data gốc vào, layout.ts sẽ tự phù phép mũi tên)
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

  if (loading) return <div className="p-10 text-white">Đang tải dữ liệu...</div>;

  return (
    // 1. Đổi màu nền ngoài cùng thành Slate-950 (Tone màu cực tối, hợp với Dark Mode)
    <div className="flex flex-col h-screen w-full bg-slate-950 items-center justify-center">
      
      {/* 2. Đổi màu nền bên trong giống hệt bên ngoài, xóa border-x để tàng hình viền */}
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
          {/* 3. Tùy chỉnh Background lưới (Dotted) của React Flow cho mờ ảo hơn */}
          <Background color="#334155" gap={20} size={1.5} />
        </ReactFlow>
      </main>
    </div>
  );
}