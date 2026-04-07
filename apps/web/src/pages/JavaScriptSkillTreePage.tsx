import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';

import jsData from '../javascript.json'; 

/* =========================================
   CÁC CUSTOM NODES (Tùy chỉnh Giao diện)
========================================= */

// Checkmark icon component
const Checkmark = ({ className }: { className?: string }) => (
  <div className={`absolute -top-3 -right-3 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${className || ''}`}>
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
);

// Node chính (Topic) - Khối vàng chữ đen
const TopicNode = ({ data }: any) => (
  <div className="relative bg-[#ffe14f] border-2 border-black px-6 py-3 rounded-lg shadow-sm min-w-[180px] text-center group hover:scale-105 transition-transform">
    <Checkmark />
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <span className="text-black font-bold text-lg tracking-wide">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <Handle type="source" position={Position.Right} className="opacity-0" />
    <Handle type="source" position={Position.Left} className="opacity-0" />
  </div>
);

// Node phụ (Subtopic) - Khối vàng nhạt, viền nét đứt
const SubtopicNode = ({ data }: any) => (
  <div className="relative bg-[#ffe873] border-[1.5px] border-black border-dashed px-4 py-2 rounded-md min-w-[120px] text-center hover:border-solid transition-all">
    <Checkmark className="w-5 h-5 -top-2 -right-2 border-[1.5px] scale-90" />
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <Handle type="target" position={Position.Left} className="opacity-0" />
    <span className="text-black font-semibold text-sm">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <Handle type="source" position={Position.Right} className="opacity-0" />
  </div>
);

// Trục dọc (Vertical) - Dùng làm đường nối blue
const VerticalNode = () => (
  <div className="w-full h-full border-l-[3.5px] border-dashed border-[#2b78e4]">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

// Text thuần (Label, Title, Paragraph)
const TextNode = ({ data }: any) => (
  <div className="text-black font-black text-center p-2 text-2xl">
    {data.label}
  </div>
);

/* =========================================
   MAIN COMPONENT
========================================= */
export const JavaScriptSkillTreePage: React.FC = () => {
  // Map các type trong JSON với giao diện Custom Node của chúng ta
  const nodeTypes = useMemo(() => ({
    topic: TopicNode,
    subtopic: SubtopicNode,
    vertical: VerticalNode,
    title: TextNode,
    paragraph: TextNode,
    label: TextNode,
    button: SubtopicNode, // Dùng chung style với Subtopic cho nút bấm
    section: () => null,  // Ẩn các khối background rác
    legend: () => null    // Ẩn ghi chú mặc định
  }), []);

  // Xử lý dữ liệu ban đầu
  const initialNodes = jsData.nodes.map(node => ({
    ...node,
  }));

  const initialEdges = jsData.edges.map(edge => ({
    ...edge,
    animated: false,
    style: { stroke: '#2b78e4', strokeWidth: 2, strokeDasharray: '4 4' }
  }));

  return (
    <div className="w-full h-screen bg-[#f9fafb] flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-black text-black">
          JavaScript Roadmap
        </h1>
        <button className="bg-[#2b78e4] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
          Download PDF
        </button>
      </header>

      {/* React Flow Canvas (Nơi vẽ sơ đồ) */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView // Tự động zoom để vừa màn hình khi load
          minZoom={0.1}
          maxZoom={1.5}
          className="bg-[#f9fafb]"
        >
          {/* Nền lưới chấm (Dot) */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1.5} 
            color="#d1d5db" 
          />
          
          {/* Thanh công cụ Zoom góc trái */}
          <Controls 
            className="bg-white border border-gray-200 fill-black rounded-lg shadow-md"
            showInteractive={false}
          />
          
          {/* Bản đồ thu nhỏ góc phải */}
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'topic') return '#ffe14f';
              if (node.type === 'subtopic') return '#ffe873';
              if (node.type === 'vertical') return '#2b78e4';
              return 'transparent';
            }}
            maskColor="rgba(249, 250, 251, 0.7)"
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          />
        </ReactFlow>
      </div>

    </div>
  );
};