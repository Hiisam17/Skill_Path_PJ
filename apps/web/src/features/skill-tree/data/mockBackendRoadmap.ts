export interface ResourceNode {
  id: string;
  title: string;
  url: string;
  type: "article" | "video" | "course";
}

export type SkillStatus = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "LOCKED";

export interface SkillNodeUI {
  id: string;
  name: string;
  description: string;
  status: SkillStatus;
  isOptional: boolean;
  category: string;
  resources: ResourceNode[];
}

export const BACKEND_ROADMAP_MOCK: SkillNodeUI[] = [
  {
    id: "internet",
    name: "Internet",
    description: "How does the internet work? Learn about TCP/IP, DNS, HTTP, and Browsers. This is the foundation of backend development.",
    status: "COMPLETED",
    isOptional: false,
    category: "Fundamentals: Internet & OS",
    resources: [
      { id: "r1", title: "How does the Internet work?", url: "https://developer.mozilla.org/en-US/docs/Learn", type: "article" },
      { id: "r2", title: "Crash Course Computer Science: The Internet", url: "https://youtube.com", type: "video" }
    ]
  },
  {
    id: "basic-os",
    name: "Basic OS & Terminal",
    description: "Learn basic terminal commands, OS concepts, memory management, and process execution.",
    status: "COMPLETED",
    isOptional: false,
    category: "Fundamentals: Internet & OS",
    resources: [
      { id: "r3", title: "Linux Survival Guide", url: "https://linuxsurvival.com/", type: "course" }
    ]
  },
  {
    id: "languages",
    name: "Backend Languages",
    description: "Choose and deep-dive into a backend programming language like Node.js, Python, Go, Java, or Ruby.",
    status: "IN_PROGRESS",
    isOptional: false,
    category: "Core Backend Skills",
    resources: [
      { id: "r4", title: "What Language Should I Learn?", url: "https://roadmap.sh", type: "article" },
      { id: "r5", title: "Node.js Crash Course", url: "https://youtube.com", type: "video" }
    ]
  },
  {
    id: "vcs",
    name: "Version Control Systems",
    description: "Understand Git and GitHub, branching strategies (GitFlow), merging, and pull requests.",
    status: "NOT_STARTED",
    isOptional: false,
    category: "Core Backend Skills",
    resources: [
      { id: "r6", title: "Git Guide & Documentation", url: "https://git-scm.com/docs", type: "article" }
    ]
  },
  {
    id: "relational-dbs",
    name: "Relational Databases",
    description: "Learn SQL, PostgreSQL, MySQL, ACID concepts, and database design principles.",
    status: "LOCKED",
    isOptional: false,
    category: "Data Storage",
    resources: [
      { id: "r7", title: "PostgreSQL Tutorial", url: "https://postgresqltutorial.com", type: "article" },
      { id: "r8", title: "Database Design Course", url: "https://youtube.com", type: "course" }
    ]
  },
  {
    id: "nosql-dbs",
    name: "NoSQL Databases",
    description: "Learn document and key-value stores. Understand when to use NoSQL vs SQL (MongoDB, Redis).",
    status: "LOCKED",
    isOptional: false,
    category: "Data Storage",
    resources: [
      { id: "r9", title: "MongoDB in 100 Seconds", url: "https://youtube.com", type: "video" }
    ]
  },
  {
    id: "apis",
    name: "APIs Design",
    description: "Learn about RESTful design, JSON APIs, GraphQL, and gRPC patterns.",
    status: "LOCKED",
    isOptional: false,
    category: "Architecture & Systems",
    resources: [
      { id: "r10", title: "REST API Concepts", url: "https://restfulapi.net/", type: "article" }
    ]
  },
  {
    id: "caching",
    name: "Caching",
    description: "Learn caching concepts, CDN, Server Side caching, and in-memory caches like Redis or Memcached.",
    status: "LOCKED",
    isOptional: true,
    category: "Architecture & Systems",
    resources: [
      { id: "r11", title: "Caching Best Practices", url: "https://aws.amazon.com/caching/", type: "article" }
    ]
  },
  {
    id: "security",
    name: "Web Security",
    description: "Understand HTTPS, CORS, CSP, OWASP Top 10, Authentication (JWT, OAuth) vs Authorization.",
    status: "LOCKED",
    isOptional: false,
    category: "Quality Assurance",
    resources: [
      { id: "r12", title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "article" }
    ]
  },
  {
    id: "testing",
    name: "Testing",
    description: "Learn unit testing, integration testing, mocking, and functional testing basics (Jest, Mocha, PyTest).",
    status: "LOCKED",
    isOptional: false,
    category: "Quality Assurance",
    resources: [
      { id: "r13", title: "Software Testing Guide", url: "https://martinfowler.com/testing/", type: "article" }
    ]
  },
  {
    id: "ci-cd",
    name: "CI / CD",
    description: "Learn continuous integration and automated deployment with GitHub Actions or GitLab CI.",
    status: "LOCKED",
    isOptional: false,
    category: "Infrastructure",
    resources: [
      { id: "r14", title: "What is CI/CD?", url: "https://redhat.com/en/topics/devops/what-is-ci-cd", type: "article" }
    ]
  },
  {
    id: "containers",
    name: "Containers",
    description: "Learn Docker, creating Dockerfiles, Docker Compose, and containerization best practices.",
    status: "LOCKED",
    isOptional: false,
    category: "Infrastructure",
    resources: [
      { id: "r15", title: "Docker in 100 Seconds", url: "https://youtube.com", type: "video" }
    ]
  }
];
