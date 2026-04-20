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
    title: "Node.js Backend Developer",
    companyName: "Tiki",
    logo: "https://via.placeholder.com/60?text=TIKI",
    isHot: true,
    description: "Tìm kiếm lập trình viên Backend chuyên sâu về JavaScript/Node.js ecosystem. Bắt buộc hiểu vững Node.js, Express, và PostgreSQL.",
    roadmapPath: "/roadmaps/2",
    gapNodes: ["Node.js", "Express", "PostgreSQL", "TypeScript"]
  },
  {
    id: "job-2",
    title: "Go Backend Engineer",
    companyName: "Grab",
    logo: "https://via.placeholder.com/60?text=GRB",
    isHot: true,
    description: "Cần Backend Engineer xây dựng Microservices. Yêu cầu làm chủ Go (Golang), gRPC, Docker và Redis.",
    roadmapPath: "/roadmaps/2",
    gapNodes: ["Go", "gRPC", "Docker", "Redis", "Microservices"]
  },
  {
    id: "job-3",
    title: "Java Spring Boot Dev",
    companyName: "VNG Corporation",
    logo: "https://via.placeholder.com/60?text=VNG",
    isHot: false,
    description: "The Backend team focuses on Java. Strong knowledge in Java, Spring Boot, MySQL and Apache Kafka is expected.",
    roadmapPath: "/roadmaps/2",
    gapNodes: ["Java", "Spring Boot", "Relational Databases", "Kafka", "Data Structures & Algorithms"]
  }
];
