import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import "./DashboardPage.css";

import jsData from '../javascript.json'; 

/* ── SVG Icon Components ── */
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L10 4l7 6.5" /><path d="M5 9.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9.5" />
  </svg>
);
const RoadmapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v12" /><path d="M4 4h6l2 2-2 2H4" /><path d="M4 12h8l2-2-2-2" />
  </svg>
);
const SkillTreeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="4" r="2" /><circle cx="5" cy="14" r="2" /><circle cx="15" cy="14" r="2" /><path d="M10 6v4M10 10l-5 2M10 10l5 2" />
  </svg>
);
const JobMarketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="14" height="10" rx="1.5" /><path d="M7 7V5.5A1.5 1.5 0 018.5 4h3A1.5 1.5 0 0113 5.5V7" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="3" /><path d="M10 1.5v2M10 16.5v2M3.15 3.15l1.42 1.42M15.43 15.43l1.42 1.42M1.5 10h2M16.5 10h2M3.15 16.85l1.42-1.42M15.43 4.57l1.42-1.42" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3" /><path d="M10 10H3m0 0l3-3m-3 3l3 3" />
  </svg>
); 

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
    {/* Top Handles */}
    <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
    <Handle id="w2" type="source" position={Position.Top} className="opacity-0" />
    
    <span className="text-white font-black text-lg tracking-wide">{data.label}</span>
    
    {/* Bottom Handles */}
    <Handle id="y1" type="target" position={Position.Bottom} className="opacity-0" />
    <Handle id="y2" type="source" position={Position.Bottom} className="opacity-0" />
    
    {/* Right Handles */}
    <Handle id="x1" type="target" position={Position.Right} className="opacity-0" />
    <Handle id="x2" type="source" position={Position.Right} className="opacity-0" />
    
    {/* Left Handles */}
    <Handle id="z1" type="target" position={Position.Left} className="opacity-0" />
    <Handle id="z2" type="source" position={Position.Left} className="opacity-0" />
  </div>
);

// Node phụ (Subtopic) - Khối màu trầm, tương tác hover sáng viền
const SubtopicNode = ({ data }: any) => {
  const smallLabels = [
    'var', 'let', 'const', 
    'block', 'function', 'global', 
    '==', '===', 'object.is', 
    'call', 'apply', 'bind'
  ];
  const isSmall = smallLabels.includes(data.label.toLowerCase());
  
  return (
    <div className={`relative bg-[#222a3d] border border-gray-600 px-4 py-3 rounded-lg text-center hover:border-[#4cd7f6] hover:shadow-[0_0_15px_rgba(76,215,246,0.2)] transition-all group ${isSmall ? 'min-w-[80px]' : 'min-w-[140px]'}`}>
      <Checkmark className="w-5 h-5 -top-2 -right-2 border-[1.5px] scale-75 opacity-80 group-hover:opacity-100" />
      
      {/* Handles tương tự TopicNode */}
      <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="w2" type="source" position={Position.Top} className="opacity-0" />
      
      <span className="text-gray-300 font-semibold text-sm group-hover:text-white transition-colors">{data.label}</span>
      
      <Handle id="y1" type="target" position={Position.Bottom} className="opacity-0" />
      <Handle id="y2" type="source" position={Position.Bottom} className="opacity-0" />
      
      <Handle id="x1" type="target" position={Position.Right} className="opacity-0" />
      <Handle id="x2" type="source" position={Position.Right} className="opacity-0" />
      
      <Handle id="z1" type="target" position={Position.Left} className="opacity-0" />
      <Handle id="z2" type="source" position={Position.Left} className="opacity-0" />
    </div>
  );
};

// Trục dọc (Vertical) - Đường dẫn Cyberpunk
const VerticalNode = () => (
  <div className="w-full h-full border-l-[3px] border-dashed border-[#4cd7f6] opacity-40">
    <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
    <Handle id="y2" type="source" position={Position.Bottom} className="opacity-0" />
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
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: <HomeIcon /> },
    { path: "/roadmap", label: "Roadmap", icon: <RoadmapIcon /> },
    { path: "/javascript-roadmap", label: "Skill Tree", icon: <SkillTreeIcon /> },
    { path: "/job-market", label: "Job Market", icon: <JobMarketIcon /> },
  ];
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

  // Hệ số giãn cách (tăng lên để các Node không bị dính vào nhau)
  const SCALE_X = 1.5;
  const SCALE_Y = 1.5;

  const initialNodes = jsData.nodes.map(node => {
    // Cập nhật lại chiều dài/rộng cho các node là đường nối hoặc khối bao ngoài
    let customStyle: any = { ...node.style };
    
    if (node.type === 'vertical') {
      customStyle.height = (node.height || node.style?.height || 0) * SCALE_Y;
    }
    if (node.type === 'section') {
      customStyle.height = (node.height || node.style?.height || 0) * SCALE_Y;
      customStyle.width = (node.width || node.style?.width || 0) * SCALE_X;
    }

    let x = node.position.x * SCALE_X;
    let y = node.position.y * SCALE_Y;

    // Tùy chỉnh vị trí thủ công cho một số Node bị đè
    if (node.data?.label === 'Introduction to JavaScript') {
      y -= 30; // đẩy lên
    }
    if (node.data?.label === 'All about Variables') {
      y += 30; // đẩy xuống
    }
    if (node.data?.label === 'Classes') {
      x -= 80; // lùi sang trái
    }
    if (node.data?.label === 'Working with APIs') {
      x += 80; // tiến sang phải
    }

    return {
      ...node,
      position: { x, y },
      style: customStyle,
    };
  });

  // Chỉnh sửa các đường nối (Edges)
  const initialEdges = jsData.edges.map(edge => {
    // Xác định kiểu đường nối dựa trên handle
    // x, z thường là rẽ ngang (smoothstep), w, y là dọc (default)
    const isHorizontal = edge.sourceHandle?.startsWith('x') || edge.sourceHandle?.startsWith('z') ||
                        edge.targetHandle?.startsWith('x') || edge.targetHandle?.startsWith('z');
    
    // Đọc style dashed từ JSON
    const isDashed = edge.data?.edgeStyle === 'dashed' || 
                    (edge.style?.strokeDasharray && edge.style.strokeDasharray !== '0');

    return {
      ...edge,
      type: isHorizontal ? 'smoothstep' : 'default',
      animated: true,
      style: { 
        stroke: '#4cd7f6', 
        strokeWidth: 2, 
        strokeDasharray: isDashed ? '5 5' : undefined,
        opacity: 0.8 
      }
    };
  });

  return (
    <div className="dashboard-layout">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="sidebar z-50">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <h1>DevPath</h1>
          </div>

          <div className="sidebar-section-label">NAVIGATION</div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-links">
            <a href="#settings">
              <span className="nav-icon"><SettingsIcon /></span>
              Settings
            </a>
            <Link to="/">
              <span className="nav-icon"><LogoutIcon /></span>
              Logout
            </Link>
          </div>

          <div className="sidebar-user-card">
            <div className="sidebar-avatar">JD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Architect Navigator</div>
              <div className="sidebar-user-level">Lvl 24 Dev</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="dashboard-main relative overflow-hidden bg-[#0b1326] flex flex-col font-sans">
        
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

      </main>
    </div>
  );
};