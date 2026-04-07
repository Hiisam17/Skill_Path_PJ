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
   CÁC CUSTOM NODES (Tùy chỉnh UI DevPath)
========================================= */

// Checkmark icon component - Đổi sang màu Cyan đặc trưng
const Checkmark = ({ className }: { className?: string }) => (
  <div className={`absolute -top-3 -right-3 w-6 h-6 bg-[#4cd7f6] rounded-full border-2 border-[#171f33] flex items-center justify-center shadow-[0_0_10px_rgba(76,215,246,0.6)] z-10 ${className || ''}`}>
    <svg className="w-3 h-3 text-[#171f33]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
);

// Node chính (Topic) - Khối Bento tối màu, viền Cyan phát sáng
const TopicNode = ({ data }: any) => (
  <div className="relative bg-[#171f33] border-2 border-[#4cd7f6] px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(76,215,246,0.3)] min-w-[200px] text-center group hover:scale-105 transition-transform backdrop-blur-sm">
    <Checkmark />
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <span className="text-white font-black text-lg tracking-wide">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <Handle type="source" position={Position.Right} className="opacity-0" />
    <Handle type="source" position={Position.Left} className="opacity-0" />
  </div>
);

// Node phụ (Subtopic) - Khối màu trầm, tương tác hover sáng viền
const SubtopicNode = ({ data }: any) => (
  <div className="relative bg-[#222a3d] border border-gray-600 px-4 py-3 rounded-lg min-w-[140px] text-center hover:border-[#4cd7f6] hover:shadow-[0_0_15px_rgba(76,215,246,0.2)] transition-all group">
    <Checkmark className="w-5 h-5 -top-2 -right-2 border-[1.5px] scale-75 opacity-80 group-hover:opacity-100" />
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <Handle type="target" position={Position.Left} className="opacity-0" />
    <span className="text-gray-300 font-semibold text-sm group-hover:text-white transition-colors">{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <Handle type="source" position={Position.Right} className="opacity-0" />
  </div>
);

// Trục dọc (Vertical) - Đường dẫn Cyberpunk
const VerticalNode = () => (
  <div className="w-full h-full border-l-[3px] border-dashed border-[#4cd7f6] opacity-40">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

// Text thuần (Label, Title, Paragraph) - Chữ màu xám sáng
const TextNode = ({ data }: any) => (
  <div className="text-gray-400 font-black text-center p-2 text-2xl tracking-tight">
    {data.label}
  </div>
);

/* =========================================
   MAIN COMPONENT
========================================= */
export const JavaScriptSkillTreePage: React.FC = () => {
  const nodeTypes = useMemo(() => ({
    topic: TopicNode,
    subtopic: SubtopicNode,
    vertical: VerticalNode,
    title: TextNode,
    paragraph: TextNode,
    label: TextNode,
    button: SubtopicNode, 
    section: () => null,  
    legend: () => null    
  }), []);

  const initialNodes = jsData.nodes.map(node => ({
    ...node,
  }));

  // Chỉnh sửa các đường nối (Edges) cho hợp tone
  const initialEdges = jsData.edges.map(edge => ({
    ...edge,
    animated: true, // Bật hiệu ứng dòng chảy dữ liệu
    style: { stroke: '#4cd7f6', strokeWidth: 2, strokeDasharray: '5 5', opacity: 0.7 }
  }));

  return (
    // Đổi màu nền tống thể sang màu tối của dự án
    <div className="w-full h-screen bg-[#0b1326] flex flex-col font-sans">
      
      {/* Header Bar - Glassmorphism tối */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-[#0b1326]/80 backdrop-blur-md border-b border-[#334155]/50 p-5 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-black text-white tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#4cd7f6] to-cyan-600">JS</span> Skill Tree
        </h1>
        <div className="flex gap-4">
          <button className="bg-[#1E293B] border border-[#334155] text-cyan-400 px-4 py-2 rounded-full font-bold text-sm shadow hover:border-cyan-400 transition-colors">
            AI Tutor Active
          </button>
          <button className="bg-gradient-to-br from-[#4cd7f6] to-cyan-600 text-[#0b1326] px-6 py-2 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(76,215,246,0.3)]">
            Tiếp tục học
          </button>
        </div>
      </header>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView 
          minZoom={0.1}
          maxZoom={1.5}
          className="bg-[#0b1326]"
        >
          {/* Nền lưới chấm tối màu */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={2} 
            color="#222a3d" 
          />
          
          {/* Thanh công cụ Zoom - Theme Dark */}
          <Controls 
            className="bg-[#1E293B] border border-[#334155] fill-white rounded-lg shadow-xl overflow-hidden [&>button]:border-b-[#334155] [&>button:hover]:bg-[#2D3449]"
            showInteractive={false}
          />
          
          {/* Bản đồ thu nhỏ - Theme Dark */}
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'topic') return '#4cd7f6';
              if (node.type === 'subtopic') return '#222a3d';
              if (node.type === 'vertical') return '#06b6d4';
              return 'transparent';
            }}
            maskColor="rgba(11, 19, 38, 0.8)"
            className="bg-[#171f33] border border-[#334155] rounded-xl shadow-2xl overflow-hidden"
          />
        </ReactFlow>
      </div>

    </div>
  );
};