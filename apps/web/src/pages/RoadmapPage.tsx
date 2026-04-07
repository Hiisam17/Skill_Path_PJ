import React from "react";
import { Link } from "react-router-dom";

type NodeItem = {
  id: string;
  label: React.ReactNode;
};

type RowData = {
  id: string;
  centerNode: React.ReactNode;
  leftNodes?: NodeItem[];
  rightNodes?: NodeItem[];
};

const Pair = ({ a, b }: { a: string; b: string }) => (
  <div className="flex gap-2 w-full justify-center">
    <div className="flex-1 bg-[#0F172A] border border-[#334155] rounded py-1 max-w-[80px] text-xs font-semibold">
      {a}
    </div>
    <div className="flex-1 bg-[#0F172A] border border-[#334155] rounded py-1 max-w-[80px] text-xs font-semibold">
      {b}
    </div>
  </div>
);

const BadgeTuple = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2 justify-center">
    {items.map((item) => (
      <span
        key={item}
        className="bg-[#2D3449] px-2 py-1 rounded text-xs font-semibold text-gray-200"
      >
        {item}
      </span>
    ))}
  </div>
);

const LeftNode = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group w-full min-w-[180px] max-w-[260px] bg-[#1E293B] border border-[#334155] text-gray-300 px-5 py-3 rounded-lg text-sm text-center z-10 shadow-lg hover:border-cyan-400 transition-colors after:absolute after:top-1/2 after:-right-44 after:w-44 after:border-t-2 after:border-dashed after:border-[#06B6D4] after:opacity-60 after:-z-10 flex flex-col items-center justify-center">
    {children}
  </div>
);

const RightNode = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group w-full min-w-[180px] max-w-[260px] bg-[#1E293B] border border-[#334155] text-gray-300 px-5 py-3 rounded-lg text-sm text-center z-10 shadow-lg hover:border-cyan-400 transition-colors before:absolute before:top-1/2 before:-left-44 before:w-44 before:border-t-2 before:border-dashed before:border-[#06B6D4] before:opacity-60 before:-z-10 flex flex-col items-center justify-center">
    {children}
  </div>
);

const roadmapData: RowData[] = [
  {
    id: "html",
    centerNode: "HTML",
    leftNodes: [
      {
        id: "related",
        label: (
          <div className="text-left w-full pointer-events-none">
            <p className="font-bold mb-2 text-[#dae2fd] text-xs uppercase tracking-wider text-center border-b border-[#334155] pb-2">
              Related Roadmaps
            </p>
            <ul className="text-slate-400 text-xs mt-2 space-y-2 flex flex-col items-center">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Frontend Roadmap
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> CSS Roadmap
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> JavaScript Roadmap
              </li>
            </ul>
          </div>
        ),
      },
    ],
  },
  {
    id: "intro",
    centerNode: "Introduction",
    leftNodes: [
      { id: "what-is-markup", label: "What are markup languages?" },
      {
        id: "frontend-dev",
        label: (
          <div className="flex flex-col gap-2 w-full relative">
            <span>Frontend Development</span>
            <div className="flex gap-2 justify-center mt-2 border-t border-dashed border-[#334155] pt-3 relative">
               <div className="absolute -top-3 left-1/2 w-[1px] h-3 border-l border-dashed border-[#334155]"></div>
              <span className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-xs font-semibold">
                HTML
              </span>
              <span className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-xs font-semibold">
                CSS
              </span>
              <span className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-xs font-semibold">
                JS
              </span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "how-web-works",
    centerNode: "How the web works",
    rightNodes: [
      { id: "http", label: "What is HTTP?" },
      { id: "domain", label: "Domain names" },
      { id: "hosting", label: "Hosting" },
      { id: "dns", label: "DNS" },
      { id: "browsers", label: "Browsers" },
      { id: "seo", label: "What is SEO?" },
    ],
  },
  {
    id: "first-html",
    centerNode: "Your First HTML File",
    leftNodes: [
      { id: "tags-attr", label: "Tags and Attributes" },
      { id: "case", label: "Case Insensitivity" },
      { id: "entities", label: "HTML Entities" },
      { id: "comments", label: "HTML Comments" },
      { id: "whitespace", label: "Whitespaces" },
    ],
  },
  {
    id: "basic-tags",
    centerNode: "Basic Tags",
    rightNodes: [
      { id: "doctype", label: "!DOCTYPE" },
      { id: "html-body", label: <Pair a="html" b="body" /> },
      { id: "head-meta", label: <Pair a="head" b="meta" /> },
    ],
  },
  {
    id: "textual-tags",
    centerNode: "Textual Tags",
    leftNodes: [
      { id: "h1-h6", label: "h1 to h6" },
      { id: "title-p", label: <Pair a="title" b="p" /> },
      { id: "hr-br", label: <Pair a="hr" b="br" /> },
      { id: "b-strong-pre", label: <Pair a="b / strong" b="pre" /> },
      { id: "i-em-mark", label: <Pair a="i / em" b="mark" /> },
      { id: "sub-sup", label: <Pair a="sub" b="sup" /> },
      { id: "links", label: "Links" },
    ],
  },
  {
    id: "grouping-text",
    centerNode: "Grouping text",
    rightNodes: [{ id: "div-span", label: <Pair a="div" b="span" /> }],
  },
  {
    id: "standard-attributes",
    centerNode: "Standard attributes",
    leftNodes: [
      { id: "id-class", label: <Pair a="id" b="class" /> },
      { id: "data-attr", label: "Data Attributes" },
      { id: "style", label: "style" },
    ],
  },
  {
    id: "table-tag",
    centerNode: "Table Tag",
  },
  {
    id: "lists-and-types",
    centerNode: "Lists and Types",
    rightNodes: [
      { id: "ordered", label: "Ordered lists" },
      { id: "unordered", label: "Unordered lists" },
      { id: "definition", label: "Definition lists" },
      { id: "nested", label: "Nested lists" },
    ],
  },
  {
    id: "embedding-media",
    centerNode: "Embedding Media",
    leftNodes: [
      {
        id: "images",
        label: (
          <div className="flex flex-col gap-3 w-full">
            <span>Images</span>
            <div className="flex flex-col gap-1 border-t border-dashed border-[#334155] pt-3 relative">
               <div className="absolute -top-3 left-1/2 w-[1px] h-3 border-l border-dashed border-[#334155]"></div>
              <span className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-xs">Priority Hints</span>
              <span className="bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-xs">img vs figure</span>
            </div>
          </div>
        ),
      },
      { id: "audio-video", label: <Pair a="Audio" b="Video" /> },
      { id: "csp-iframe", label: <Pair a="CSP" b="iframe" /> },
    ],
  },
  {
    id: "using-forms",
    centerNode: "Using Forms",
    rightNodes: [
      { id: "labels-inputs", label: "Labels and Inputs" },
      { id: "file-uploads", label: "File Uploads" },
      { id: "form-validation", label: "Form Validation" },
      { id: "limitations", label: "Limitations" },
    ],
  },
  {
    id: "semantic-markup",
    centerNode: "Semantic Markup",
    leftNodes: [
      {
        id: "semantic-groups",
        label: (
          <div className="flex flex-col gap-4 w-full text-xs">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-gray-400">Highlighting Changes</span>
              <BadgeTuple items={["del", "s", "ins"]} />
            </div>
            <div className="flex flex-col gap-2 border-t border-[#334155] pt-2">
              <span className="font-bold text-gray-400">Quotation / Citation</span>
              <BadgeTuple items={["abbr", "cite", "dfn", "address", "blockquote", "q"]} />
            </div>
            <div className="flex flex-col gap-2 border-t border-[#334155] pt-2">
              <span className="font-bold text-gray-400">Layout tags</span>
              <BadgeTuple items={["header", "nav", "main", "section", "article", "aside", "footer"]} />
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "styling-basics",
    centerNode: "Styling Basics",
    leftNodes: [
      { id: "inline-css", label: "Inline CSS" },
      { id: "internal-css", label: "Internal CSS" },
      { id: "external-css", label: "External CSS" },
    ],
  },
  {
    id: "including-js",
    centerNode: "Including JavaScript",
  },
  {
    id: "accessibility",
    centerNode: "Accessibility",
  },
  {
    id: "seo-basics",
    centerNode: "Basics of SEO",
  },
];

export const RoadmapPage = () => {
  return (
    <div className="bg-[#0b1326] text-[#dae2fd] min-h-screen selection:bg-[#4cd7f6]/30 font-['Inter'] flex">
      {/* Side Navigation Bar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-[#171f33] shadow-2xl shadow-black/50 flex flex-col pt-20 pb-8 px-4 hidden lg:flex">
        <div className="flex flex-col gap-2 mb-8 px-2">
          <div className="flex items-center gap-3 p-2 border-b border-[#334155] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#2d3449] overflow-hidden flex items-center justify-center text-xl font-bold bg-gradient-to-br from-cyan-400 to-blue-600 text-[#0b1326]">
              JD
            </div>
            <div>
              <p className="text-sm font-bold text-[#dae2fd]">Architect Navigator</p>
              <p className="text-[10px] uppercase tracking-widest text-cyan-400">
                Lvl 24 Dev
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link
            to="/dashboard"
            className="text-slate-400 hover:bg-[#222a3d] hover:text-slate-100 flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all rounded-lg"
          >
            <span>Home</span>
          </Link>
          <Link
            to="/roadmap"
            className="bg-[#2d3449] text-cyan-400 border-l-4 border-cyan-400 flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all rounded-r-lg"
          >
            <span>Roadmap</span>
          </Link>
          <Link
            to="/career-paths"
            className="text-slate-400 hover:bg-[#222a3d] hover:text-slate-100 flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all rounded-lg"
          >
            <span>Projects / Skill Tree</span>
          </Link>
        </nav>
        <div className="mt-auto px-2 space-y-4">
          <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-[#0b1326] font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform">
            Settings
          </button>
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="text-slate-400 hover:text-red-400 flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-widest transition-colors"
            >
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64 flex-1 min-h-screen relative overflow-x-auto no-scrollbar">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 lg:left-64 right-0 z-40 bg-[#0b1326]/80 backdrop-blur-md border-b border-[#334155]/50 flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-cyan-600">
              DevPath - Skill Tree
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#1E293B] border border-[#334155] text-cyan-400 px-4 py-2 rounded-full font-bold text-sm shadow hover:border-cyan-400 transition-colors">
              AI Tutor Active
            </button>
          </div>
        </header>

        {/* The Map Diagram */}
        <div className="min-w-[1024px] flex flex-col items-center w-full max-w-7xl mx-auto pt-32 pb-20 gap-y-16 bg-[#0b1326] relative px-12">
          {/* Continuous Central Line */}
          <div className="absolute top-32 bottom-40 left-1/2 -translate-x-[2px] w-[3px] bg-[#06B6D4] opacity-80 z-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] rounded-full"></div>

          {roadmapData.map((row) => (
            <div
              key={row.id}
              className="flex flex-row w-full items-center relative z-10"
            >
              {/* Left Column */}
              <div className="flex-1 flex flex-col items-end pr-12 gap-4">
                {row.leftNodes?.map((node) => (
                  <LeftNode key={node.id}>{node.label}</LeftNode>
                ))}
              </div>

              {/* Center Column */}
              <div className="w-64 flex flex-col justify-center items-center relative z-20">
                <div className="bg-[#1E293B] border-2 border-[#06B6D4] text-[#F8FAFC] px-6 py-4 rounded-xl font-bold w-full text-center shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 transition-transform cursor-pointer tracking-wider">
                  {row.centerNode}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col items-start pl-12 gap-4">
                {row.rightNodes?.map((node) => (
                  <RightNode key={node.id}>{node.label}</RightNode>
                ))}
              </div>
            </div>
          ))}

          {/* Footer Learning Paths */}
          <div className="mt-16 bg-[#171f33] border border-[#334155] p-8 rounded-xl relative z-20 flex flex-col items-center gap-6 shadow-2xl">
            <p className="text-slate-300 font-bold text-lg text-center">
              Visit the following roadmaps to keep learning
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <button className="bg-[#2D3449] border-b-4 border-[#3131c0] text-blue-300 hover:text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:-translate-y-1 transition-all">
                Frontend
              </button>
              <button className="bg-[#2D3449] border-b-4 border-[#3131c0] text-blue-300 hover:text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:-translate-y-1 transition-all">
                CSS
              </button>
              <button className="bg-[#2D3449] border-b-4 border-[#3131c0] text-blue-300 hover:text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:-translate-y-1 transition-all">
                JavaScript
              </button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-6 border-t border-[#334155]/30">
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            © 2024 DevPath. The Architectural Navigator for your IT Career.
          </p>
        </footer>
      </main>

      {/* Floating Action / Tutor Button */}
      <button className="fixed bottom-8 right-8 bg-[#171f33] border border-[#06B6D4] text-cyan-400 px-6 py-3 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/20 z-50 hover:bg-[#06B6D4] hover:text-[#0b1326] transition-all font-bold tracking-wide gap-3">
        <span className="text-xl">✨</span> AI Tutor: Have a question? Type here
      </button>
    </div>
  );
};
