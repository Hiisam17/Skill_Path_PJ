export interface SuggestedJob {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  skills?: string[];
  jobType?: string;
  highlights?: string[];
  requirements?: string;
  source?: string;
  sourceUrl?: string;
  logo?: string;
  isHot?: boolean;
  description: string;
  roadmapPath: string;
  gapNodes: string[];
}

export const MOCK_JOBS: SuggestedJob[] = [
  {
    id: "1",
    title: "Backend Developer (.NET / ASP.NET)",
    companyName: "GrapeCity",
    location: "Hà Nội",
    skills: ["ASP.NET", "VueJS", "ReactJS", ".NET", "C#", "SQL"],
    jobType: "At office",
    highlights: [
      "Enjoyable Team Environment",
      "Engaging and Innovative Work",
      "13 month salary and bonus",
    ],
    description: `
      - Develop and maintain backend systems using ASP.NET / .NET (C#)
      - Collaborate with frontend teams using VueJS / ReactJS
      - Design and optimize SQL databases
      - Write clean, maintainable, and well-documented code
      - Participate in code reviews and technical discussions
    `,
    requirements: `
      - Proficient in C# and .NET / ASP.NET framework
      - Experience with RESTful API design
      - Solid knowledge of SQL (query optimization, schema design)
      - Familiar with VueJS or ReactJS is a plus
      - Good communication and teamwork skills
    `,
    roadmapPath: "/roadmaps/javascript",
    gapNodes: ["csharp", "mssql", "client side"],
    source: "ITviec",
    sourceUrl: "https://itviec.com/it-jobs/back-end",
  },
  {
    id: "2",
    title: "Backend Developer (Java / Spring / Finance)",
    companyName: "Goline Corporation",
    location: "Hà Nội",
    skills: ["Java", "Maven", "AI", "Spring", "Oracle", "SQL"],
    jobType: "At office",
    highlights: [
      "Làm việc với các công nghǇ mới nhầt",
      "MɁnh vực chứng khoán, tài chính hấp dẫn",
      "Liên tục được đào tạo chuyên môn, gĩ năng",
    ],
    description: `
      - Build and maintain backend systems for a securities/finance platform
      - Develop microservices using Java Spring Framework
      - Work with Oracle/SQL databases for financial data processing
      - Integrate AI features into backend workflows
      - Ensure high availability and performance of core systems
    `,
    requirements: `
      - 2+ years of experience with Java and Spring Framework
      - Experience with Oracle or SQL databases
      - Understanding of Maven build tools
      - Interest in fintech / securities domain
      - Ability to work in a fast-paced environment
    `,
    roadmapPath: "/roadmaps/javascript",
    gapNodes: ["java", "oracle", "integration testing"],
    source: "ITviec",
    sourceUrl: "https://itviec.com/it-jobs/back-end",
  },
  {
    id: "3",
    title: "Backend Developer (Golang / @WS / AI)",
    companyName: "ANDPAD VietNam Co., Ltd",
    location: "Hồ Chí Minh / Hà Nội",
    skills: ["Golang", "Design Systems", "Unit Test", "AI", "AWS", "English"],
    jobType: "Hybrid",
    highlights: [
      "Work with Japanese construction-tech product",
      "Hybrid work model",
      "English working environment",
    ],
    description: `
      - Design and implement backend services using Golang
      - Deploy and manage infrastructure on AWS
      - Write unit tests and ensure code quality
      - Integrate AI/ML features into product workflows
      - Collaborate with cross-functional teams in English
    `,
    requirements: `
      - Proficient in Golang (1+ year hands-on)
      - Experience with AWS services (EC2, S3, Lambda, etc.)
      - Good understanding of unit testing best practices
      - Business-level English communication
      - Experience with AI integration is a plus
    `,
    roadmapPath: "/roadmaps/javascript",
    gapNodes: ["go", "unit testing", "serverless", "microservices"],
    source: "ITviec",
    sourceUrl: "https://itviec.com/it-jobs/back-end",
  },
  {
    id: "4",
    title: "Backend Developer (Ruby on Rails / PostgreSQL)",
    companyName: "LIFULL Tech Vietnam",
    location: "Hồ Chí Minh",
    skills: ["Ruby", "PostgreSQL", "Ruby on Rails", "MySQL", "AI"],
    jobType: "At office",
    highlights: [
      "Year-end Bonus & Performance review twice a year",
      "Quarterly & Annual MVP Awards",
      "Health care insurance for official employees",
    ],
    description: `
      - Develop and maintain web applications using Ruby on Rails
      - Design and optimize PostgreSQL/MySQL databases
      - Build RESTful APIs consumed by frontend teams
      - Participate in Agile/Scrum development cycles
      - Explore AI integration opportunities in product features
    `,
    requirements: `
      - 2+ years experience with Ruby on Rails
      - Strong knowledge of PostgreSQL or MySQL
      - Familiarity with RESTful API design
      - Understanding of MVC architecture
      - Passion for clean code and testing
    `,
    roadmapPath: "/roadmaps/javascript",
    gapNodes: ["ruby", "postgresql", "rest", "json apis"],
    source: "ITviec",
    sourceUrl: "https://itviec.com/it-jobs/back-end",
  },
  {
    id: "5",
    title: "Backend Developer (NodeJS / PostgreSQL / ExpressJS)",
    companyName: "OrgScale Recruitment",
    location: "Hà Nội",
    skills: ["NodeJS", "English", "PostgreSQL", "ExpressJS"],
    jobType: "At office",
    highlights: [
      "English-speaking environment",
      "Competitive salary",
      "Collaborative team culture",
    ],
    description: `
      - Build scalable REST APIs using NodeJS and ExpressJS
      - Design and manage PostgreSQL databases
      - Collaborate with frontend developers and product team
      - Review code and uphold engineering best practices
      - Communicate in English with international stakeholders
    `,
    requirements: `
      - 2+ years of NodeJS / ExpressJS experience
      - Solid understanding of PostgreSQL
      - Comfortable working in English (reading/writing)
      - Experience with Git and collaborative workflows
      - Knowledge of authentication patterns (JWT, OAuth) is a plus
    `,
    roadmapPath: "/roadmaps/javascript",
    gapNodes: ["javascript", "postgresql", "rest", "git", "github"],
    source: "ITviec",
    sourceUrl: "https://itviec.com/it-jobs/back-end",
  }
];
