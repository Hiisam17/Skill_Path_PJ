import React, { useMemo, useState } from 'react';
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

// Import all markdown files from the content folder
const contentModules = import.meta.glob('../content/*.md', { as: 'raw', eager: true });

// Map to store content by node ID
const contentMap: Record<string, string> = {};

Object.entries(contentModules).forEach(([path, content]) => {
  const filename = path.split('/').pop() || '';
  if (filename.includes('@')) {
    const id = filename.split('@')[1].replace('.md', '');
    contentMap[id] = content as string;
  } else if (filename === 'what-is-javascript.md') {
    // Special case for Introduction to JavaScript
    contentMap['6khAD6mzZ9S96JJuC5_j6'] = content as string;
  }
});

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

/* ── Drawer & Resource SVG Components ── */
const ArticleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="2" y1="7" x2="7" y2="7"></line>
    <line x1="2" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="22" y2="17"></line>
    <line x1="17" y1="7" x2="22" y2="7"></line>
  </svg>
);

const FeedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
    <path d="M4 11a9 9 0 0 1 9 9"></path>
    <path d="M4 4a16 16 0 0 1 16 16"></path>
    <circle cx="5" cy="19" r="1"></circle>
  </svg>
);

/* ── Markdown Parsing & Mock Data ── */
interface Resource {
  type: string;
  title: string;
  url: string;
}

interface ParsedMarkdown {
  title: string;
  description: string[];
  resources: Resource[];
}

const parseCustomMarkdown = (md: string): ParsedMarkdown => {
  const lines = md.split('\n');
  let title = '';
  const description: string[] = [];
  const resources: Resource[] = [];
  
  const resourceRegex = /-\s+\[@(.*?)@(.*?)\]\((.*?)\)/;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      continue;
    }
    
    const match = line.match(resourceRegex);
    if (match) {
      resources.push({
        type: match[1] || 'article',
        title: match[2].trim(),
        url: match[3].trim()
      });
      continue;
    }

    if (line.toLowerCase().includes('visit the following resources')) {
      continue;
    }

    if (line.trim() !== '') {
      description.push(line.trim());
    }
  }

  return { title, description, resources };
};

// mockMarkdown đã được thay thế bằng contentMap động

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

    <span className="text-white font-black text-lg tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{data.label}</span>

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

// Trục dọc (Vertical) - Ẩn đi để nhường chỗ cho Custom Flow Line
const VerticalNode = () => (
  <div className="w-full h-full opacity-0 pointer-events-none">
    <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
    <Handle id="y2" type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

// Text thuần (Label, Title, Paragraph) - Chữ màu xám sáng
const TextNode = ({ data }: any) => (
  <div className="text-gray-200 font-bold text-center p-2 text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">
    {data.label}
  </div>
);

// Title đặc biệt cho "JavaScript"
const MainTitleNode = ({ data }: any) => {
  if (data.label === 'JavaScript') {
    return (
      <div className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#4cd7f6] to-[#26ffbb] py-4 px-2 select-none">
        {data.label}
      </div>
    );
  }
  return (
    <div className="text-gray-200 font-black text-3xl tracking-tight uppercase">
      {data.label}
    </div>
  );
};


/* =========================================
   MAIN COMPONENT
========================================= */
export const JavaScriptSkillTreePage: React.FC = () => {
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<ParsedMarkdown | null>(null);

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    // Ngăn chặn sự kiện cho các node cấu trúc
    if (node.type === 'vertical' || node.type === 'section' || node.type === 'legend') return;
    
    // Lấy nội dung từ contentMap dựa trên ID của node
    const markdownContent = contentMap[node.id];
    
    if (markdownContent) {
      const parsedData = parseCustomMarkdown(markdownContent);
      setSelectedNodeData(parsedData);
      setIsPanelOpen(true);
    } else {
      // Fallback nếu không có nội dung md
      setSelectedNodeData({
        title: node.data.label,
        description: ["Content for this topic is coming soon!"],
        resources: []
      });
      setIsPanelOpen(true);
    }
  };

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
    title: MainTitleNode,
    paragraph: TextNode,
    label: TextNode,
    button: SubtopicNode,
    section: () => null,
    legend: () => null
  }), []);

  // Hệ số giãn cách (tăng lên để các Node không bị dính vào nhau)
  const SCALE_X = 1.5;
  const SCALE_Y = 1.5;

  // Danh sách ID các node cần xoá (roadmap.sh info)
  const REMOVE_NODE_IDS = ['yHmHXymPNWwu8p1vvqD3o', 'R_Fs6rdl2XtQ9aLOubMqL'];

  const initialNodes = jsData.nodes
    .filter(node => !REMOVE_NODE_IDS.includes(node.id))
    .map(node => {
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
  let processedEdges = jsData.edges.map(edge => {
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

  // Đường flow giữa các node chính: liền nhau không đứt đoạn, có nét đậm, nối liên tiếp
  const mainFlowOrder = [
    'Introduction to JavaScript',
    'All about Variables',
    'Data Types',
    'Type Casting',
    'Data Structures',
    'Equality Comparisons',
    'Loops and Iterations',
    'Control Flow',
    'Expressions & Operators',
    'Functions',
    'DOM APIs',
    'Strict Mode',
    'Using (this) keyword',
    'Asynchronous JavaScript',
    'Working with APIs',
    'Classes',
    'Iterators and Generators',
    'Modules in JavaScript',
    'Memory Management',
    'Using Browser DevTools'
  ];

  const mainTopicIds = mainFlowOrder
    .map(label => initialNodes.find(n => n.data?.label === label)?.id)
    .filter(Boolean);
  const mainTopicIdsSet = new Set(mainTopicIds);

  // Lọc bớt các edge cũ kết nối với vertical nodes hoặc giữa các main topic hoặc node bị xoá
  const verticalNodeIds = new Set(initialNodes.filter(n => n.type === 'vertical').map(n => n.id));
  const removeNodesSet = new Set(REMOVE_NODE_IDS);
  
  processedEdges = processedEdges.filter(edge => {
    // Không dùng lại cạnh liên quan đến vertical node
    if (verticalNodeIds.has(edge.source) || verticalNodeIds.has(edge.target)) return false;
    // Không dùng lại cạnh liên quan đến node bị xoá (roadmap.sh)
    if (removeNodesSet.has(edge.source) || removeNodesSet.has(edge.target)) return false;
    // Không dùng lại cạnh nối giữa 2 main topic cũ (vì đã có flow mới)
    if (mainTopicIdsSet.has(edge.source) && mainTopicIdsSet.has(edge.target)) return false;
    return true;
  });

  const customMainEdges: any[] = [];
  for (let i = 0; i < mainTopicIds.length - 1; i++) {
    const sourceId = mainTopicIds[i];
    const targetId = mainTopicIds[i + 1];

    if (sourceId && targetId) {
      const sNode = initialNodes.find(n => n.id === sourceId);
      const tNode = initialNodes.find(n => n.id === targetId);

      let sourceHandle = 'y2'; // default bottom
      let targetHandle = 'w1'; // default top
      
      if (sNode && tNode) {
        const dx = tNode.position.x - sNode.position.x;
        const dy = tNode.position.y - sNode.position.y;
        
        // Rẽ ngang nếu khoảng cách X lớn hơn Y
        if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 100) {
          sourceHandle = dx > 0 ? 'x2' : 'z2';
          targetHandle = dx > 0 ? 'z1' : 'x1';
        } else if (dy < -50 && Math.abs(dx) < 100) {
          // Đi ngược lên trên (fallback)
          sourceHandle = 'w2';
          targetHandle = 'y1';
        }
      }

      customMainEdges.push({
        id: `custom-flow-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        sourceHandle,
        targetHandle,
        animated: true,
        style: {
          stroke: '#4cd7f6', // Nét Cyan 
          strokeWidth: 5,    // Nét đậm
          strokeDasharray: 'none', // Liền nhau không đứt đoạn
          opacity: 1
        },
        zIndex: 1000
      });
    }
  }

  const finalEdges = [...processedEdges, ...customMainEdges];

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
          <h1 className="text-2xl font-black tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#4cd7f6] to-cyan-400 drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">JS Skill Tree</span>
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
            edges={finalEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
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

        {/* Side Detail Panel (Drawer) */}
        <div 
          className={`absolute top-0 right-0 h-full w-full md:w-[420px] bg-[#171f33]/98 backdrop-blur-2xl border-l border-[#4cd7f6]/30 shadow-2xl transition-transform duration-300 ease-out z-50 flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-7 border-b border-[#334155]/60 bg-[#171f33]">
            <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
              {selectedNodeData?.title || 'Node Details'}
            </h2>
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {/* Description */}
            <div className="text-gray-100 leading-relaxed text-[15px] flex flex-col gap-4">
              {selectedNodeData?.description.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Resources */}
            {selectedNodeData?.resources && selectedNodeData.resources.length > 0 && (
              <div className="mt-4">
                <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="w-4 h-[3px] bg-[#4cd7f6] rounded shadow-[0_0_8px_rgba(76,215,246,0.5)]"></span>
                  Free Resources
                </h3>
                <div className="flex flex-col gap-3">
                  {selectedNodeData.resources.map((res, idx) => {
                    let accentColor = 'border-[#334155]';
                    let Icon = ArticleIcon;
                    if (res.type === 'article') { accentColor = 'border-yellow-400/30'; Icon = ArticleIcon; }
                    else if (res.type === 'video') { accentColor = 'border-purple-400/30'; Icon = VideoIcon; }
                    else if (res.type === 'feed') { accentColor = 'border-pink-400/30'; Icon = FeedIcon; }

                    return (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`group bg-[#222a3d]/80 border ${accentColor} hover:border-[#4cd7f6] rounded-xl p-4 flex items-start gap-4 transition-all duration-300 hover:bg-[#222a3d] hover:shadow-[0_4px_20px_rgba(76,215,246,0.15)] hover:-translate-y-0.5`}
                      >
                        <div className="mt-0.5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                          <Icon />
                        </div>
                        <div className="flex-1 text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {res.title}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-[#334155]/60 bg-[#171f33] shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
            <button 
              className="w-full bg-gradient-to-r from-[#4cd7f6] to-cyan-500 text-[#0b1326] font-black tracking-wide py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(76,215,246,0.25)] hover:shadow-[0_0_25px_rgba(76,215,246,0.4)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              onClick={() => setIsPanelOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Mark as Done
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};