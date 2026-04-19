export interface SuggestedJob {
  id: string;
  title: string;
  companyName: string;
  logo: string;
  isHot: boolean;
  description: string;
  roadmapPath: string;
  gapNodes: string[];
}

export const MOCK_JOBS: SuggestedJob[] = [
  {
    id: "job-1",
    title: "Mới ra trường Frontend Developer",
    companyName: "VNG Corporation",
    logo: "https://via.placeholder.com/60?text=VNG",
    isHot: true,
    description: "VNG đang tìm kiếm Frontend Web Developer. Yêu cầu thành thạo các kiến thức cốt lõi như HTML, CSS, JavaScript và framework React JS. Hiểu được phiên bản quản lý code bằng Github.",
    roadmapPath: "/frontend-roadmap",
    gapNodes: ["tG5v3O4lNIFc2uCnacPak", "ODcfFEorkfJNupoQygM53", "qmTVMJDsEhNIkiwE_UTYu"] // React, JS, GitHub
  },
  {
    id: "job-2",
    title: "UI/UX React Engineer",
    companyName: "Shopee",
    logo: "https://via.placeholder.com/60?text=SHP",
    isHot: false,
    description: "Shopee is looking for a frontend dev with a strong sense of design. You'll strictly be using React, CSS, and Tailwind. Knowing how to write unit tests with Vitest is a plus.",
    roadmapPath: "/frontend-roadmap",
    gapNodes: ["tG5v3O4lNIFc2uCnacPak", "eghnfG4p7i-EDWfp3CQXC", "hVQ89f6G0LXEgHIOKHDYq"] // React, Tailwind, Vitest
  },
  {
    id: "job-3",
    title: "Senior Frontend Engineer",
    companyName: "Grab",
    logo: "https://via.placeholder.com/60?text=GRB",
    isHot: true,
    description: "Hiring Senior Frontend Engineers. Requires deep understanding of JavaScript, React, state management, testing environments using Vitest, and complex styling solutions with Tailwind.",
    roadmapPath: "/frontend-roadmap",
    gapNodes: ["ODcfFEorkfJNupoQygM53", "tG5v3O4lNIFc2uCnacPak", "hVQ89f6G0LXEgHIOKHDYq", "eghnfG4p7i-EDWfp3CQXC"]
  },
  {
    id: "job-4",
    title: "Junior Web Developer",
    companyName: "FPT Software",
    logo: "https://via.placeholder.com/60?text=FPT",
    isHot: false,
    description: "Tuyển Junior Web Dev biết cách xây dựng layout cơ bản. Không yêu cầu kinh nghiệm chuyên sâu về React nhưng bắt buộc phải thành thạo HTML, CSS, thư viện npm, và biết đẩy code lên Git.",
    roadmapPath: "/frontend-roadmap",
    gapNodes: ["yWG2VUkaF5IJVVut6AiSy", "ZhJhf1M2OphYbEmduFq-9", "ib_FHinhrw8VuSet-xMF7", "R_I4SGYqLk5zze5I1zS_E"]
  },
  {
    id: "job-5",
    title: "Frontend Tester / QA",
    companyName: "MoMo",
    logo: "https://via.placeholder.com/60?text=MM",
    isHot: false,
    description: "Momo is automating its frontend validations. We need a QA who knows the Node/npm ecosystem and is very comfortable writing frontend tests using Vitest.",
    roadmapPath: "/frontend-roadmap",
    gapNodes: ["ib_FHinhrw8VuSet-xMF7", "hVQ89f6G0LXEgHIOKHDYq"]
  },
  {
    id: "job-6",
    title: "Node.js & JavaScript Backend Dev",
    companyName: "Tiki",
    logo: "https://via.placeholder.com/60?text=TIKI",
    isHot: true,
    description: "Tìm kiếm lập trình viên Backend chuyên sâu về JavaScript/Node.js ecosystem. Bắt buộc hiểu vững Core JS, Memory Management, Event Loop và thành thạo làm việc với Array/Object.",
    roadmapPath: "/javascript-roadmap",
    gapNodes: ["js-core-2", "js-functions", "js-async"] // Những ID này phải nằm trên JS roadmap
  }
];
