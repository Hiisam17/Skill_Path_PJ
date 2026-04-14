import React, { useEffect, useMemo, useState } from 'react';

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
const contentModules = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });

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

// Checkmark icon component - Cập nhật theo trạng thái
const StatusIndicator = ({ status, className }: { status?: string, className?: string }) => {
  if (status === 'not-started') return null;

  const isCompleted = status === 'completed';
  const color = isCompleted ? '#4cd7f6' : '#fb923c'; // Cyan cho Completed, Orange cho In Progress
  const glow = isCompleted ? 'rgba(76,215,246,0.6)' : 'rgba(251,146,60,0.6)';

  return (
    <div
      className={`absolute -top-3 -right-3 w-6 h-6 rounded-full border-2 border-[#171f33] flex items-center justify-center z-10 ${className || ''}`}
      style={{ backgroundColor: color, boxShadow: `0 0 10px ${glow}` }}
    >
      {isCompleted ? (
        <svg className="w-3 h-3 text-[#171f33]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
        </svg>
      ) : (
        <div className="w-1.5 h-1.5 bg-[#171f33] rounded-full animate-pulse" />
      )}
    </div>
  );
};


// Node chính (Topic) - Khối Bento tối màu, viền đổi màu theo trạng thái
const TopicNode = ({ data }: any) => {
  const status = data.status || 'not-started';
  const borderColor = status === 'completed' ? 'border-[#4cd7f6]' :
    status === 'in-progress' ? 'border-orange-400' : 'border-gray-700';
  const shadow = status === 'completed' ? 'shadow-[0_0_20px_rgba(76,215,246,0.3)]' :
    status === 'in-progress' ? 'shadow-[0_0_20px_rgba(251,146,60,0.2)]' : '';

  return (
    <div className={`relative bg-[#171f33] border-2 ${borderColor} ${shadow} px-6 py-4 rounded-xl min-w-[200px] text-center group hover:scale-105 transition-all backdrop-blur-sm`}>
      <StatusIndicator status={status} />
      {/* Top Handles */}
      <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="w2" type="source" position={Position.Top} className="opacity-0" />

      <span className={`${status === 'not-started' ? 'text-gray-500' : 'text-white'} font-black text-lg tracking-wide transition-colors`}>{data.label}</span>

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
};

// Node phụ (Subtopic) - Khối màu trầm, tương tác hover sáng viền
const SubtopicNode = ({ data }: any) => {
  const status = data.status || 'not-started';
  const smallLabels = [
    'var', 'let', 'const',
    'block', 'function', 'global',
    '==', '===', 'object.is',
    'call', 'apply', 'bind'
  ];
  const isSmall = smallLabels.includes(data.label.toLowerCase());

  const borderColor = status === 'completed' ? 'border-[#4cd7f6]/60' :
    status === 'in-progress' ? 'border-orange-400/60' : 'border-gray-600';

  return (
    <div className={`relative bg-[#222a3d] border ${borderColor} px-4 py-3 rounded-lg text-center hover:border-[#4cd7f6] hover:shadow-[0_0_15px_rgba(76,215,246,0.2)] transition-all group ${isSmall ? 'min-w-[80px]' : 'min-w-[140px]'}`}>
      <StatusIndicator status={status} className="w-5 h-5 -top-2 -right-2 border-[1.5px] scale-75 opacity-80 group-hover:opacity-100" />

      {/* Handles tương tự TopicNode */}
      <Handle id="w1" type="target" position={Position.Top} className="opacity-0" />
      <Handle id="w2" type="source" position={Position.Top} className="opacity-0" />

      <span className={`${status === 'not-started' ? 'text-gray-500' : 'text-gray-200'} font-semibold text-sm group-hover:text-white transition-colors`}>{data.label}</span>

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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedNodeData, setSelectedNodeData] = useState<ParsedMarkdown & { id: string } | null>(null);

  // State quản lý trạng thái của từng node — đồng bộ với localStorage
  const JS_PROGRESS_KEY = "jsRoadmapProgress";

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'not-started' | 'in-progress' | 'completed'>>(() => {
    try {
      const saved = localStorage.getItem(JS_PROGRESS_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  // Persist to localStorage whenever statuses change
  useEffect(() => {
    localStorage.setItem(JS_PROGRESS_KEY, JSON.stringify(nodeStatuses));
  }, [nodeStatuses]);

  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    // Ngăn chặn sự kiện cho các node cấu trúc
    if (node.type === 'vertical' || node.type === 'section' || node.type === 'legend') return;

    // Lấy nội dung từ contentMap dựa trên ID của node
    const markdownContent = contentMap[node.id];

    let parsedData: any;
    if (markdownContent) {
      parsedData = parseCustomMarkdown(markdownContent);
    } else {
      // Fallback nếu không có nội dung md
      parsedData = {
        title: node.data.label,
        description: ["Content for this topic is coming soon!"],
        resources: []
      };
    }

    setSelectedNodeData({ ...parsedData, id: node.id });
    setIsPanelOpen(true);
  };

  const updateStatus = (status: 'not-started' | 'in-progress' | 'completed') => {
    if (selectedNodeData) {
      setNodeStatuses(prev => ({
        ...prev,
        [selectedNodeData.id]: status
      }));
    }
  };



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
    if (verticalNodeIds.has(edge.source!) || verticalNodeIds.has(edge.target!)) return false;
    // Không dùng lại cạnh liên quan đến node bị xoá (roadmap.sh)
    if (removeNodesSet.has(edge.source!) || removeNodesSet.has(edge.target!)) return false;
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

  // Merge status vào nodes để React Flow cập nhật UI
  const nodes = useMemo(() => {
    return initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: nodeStatuses[node.id] || 'not-started'
      }
    }));
  }, [nodeStatuses, initialNodes]);


  return (
    <div className="dashboard-layout">


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
            nodes={nodes}
            edges={finalEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.5 }}
            minZoom={0.5}
            maxZoom={1.5}
            panOnScroll={true}
            panOnScrollMode={"vertical" as any}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
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
          <div className="flex flex-col gap-4 p-7 border-b border-[#334155]/60 bg-[#171f33]">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">CORE</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4cd7f6]/20 flex items-center justify-center text-[#4cd7f6]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-black !text-white tracking-tight">
                    {selectedNodeData?.title || 'Node Details'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all self-start"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Status Badge at Top Left */}
            <div className="flex">
              {(() => {
                const status = selectedNodeData ? (nodeStatuses[selectedNodeData.id] || 'not-started') : 'not-started';
                const config = {
                  'not-started': { label: 'NOT STARTED', color: 'text-orange-400', border: 'border-orange-400/50', bg: 'bg-orange-400/10' },
                  'in-progress': { label: 'IN PROGRESS', color: 'text-cyan-400', border: 'border-cyan-400/50', bg: 'bg-cyan-400/10' },
                  'completed': { label: 'COMPLETED', color: 'text-green-400', border: 'border-green-400/50', bg: 'bg-green-400/10' }
                } as const;
                const { label, color, border, bg } = config[status];
                return (
                  <span className={`px-3 py-1 rounded-full border ${border} ${bg} ${color} text-[10px] font-black tracking-widest`}>
                    {label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            {/* Description Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-4">OVERVIEW</h3>
              <div className="text-gray-100 leading-relaxed text-[15px] flex flex-col gap-4">
                {selectedNodeData?.description.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Resources Section */}
            {selectedNodeData?.resources && selectedNodeData.resources.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-4">LEARNING RESOURCES</h3>
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

          {/* Change Status Footer */}
          <div className="p-7 border-t border-[#334155]/60 bg-[#171f33] flex flex-col gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[2px]">CHANGE STATUS:</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['not-started', 'in-progress', 'completed'] as const).map((status) => {
                const isSelected = selectedNodeData && nodeStatuses[selectedNodeData.id] === status || (!selectedNodeData?.id && status === 'not-started') || (selectedNodeData && !nodeStatuses[selectedNodeData.id] && status === 'not-started');

                const labels = {
                  'not-started': 'Not Started',
                  'in-progress': 'In Progress',
                  'completed': 'Completed'
                };

                return (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`
                      py-3.5 px-2 rounded-xl text-[13px] font-black transition-all duration-300 border-2
                      ${isSelected
                        ? 'bg-[#1e293b] border-orange-400 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.2)]'
                        : 'bg-[#1e293b]/40 border-transparent text-gray-500 hover:bg-[#1e293b] hover:text-gray-300'
                      }
                    `}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};