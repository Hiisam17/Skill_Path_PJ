/**
 * Seed script: Migrates mock job data from frontend into the jobs table.
 * Run with: node prisma/seed-jobs.js
 */
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envDevPath = path.join(__dirname, '..', '.env.development');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envDevPath)) {
  dotenv.config({ path: envDevPath });
} else {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const directUrl = DATABASE_URL.replace(':6543/', ':5432/').replace('?pgbouncer=true', '');

const JOBS = [
  {
    title: "Backend Developer (.NET / ASP.NET)",
    company: "GrapeCity",
    location: "Hà Nội",
    skills: ["ASP.NET", "VueJS", "ReactJS", ".NET", "C#", "SQL"],
    job_type: "At office",
    description: `- Develop and maintain backend systems using ASP.NET / .NET (C#)
- Collaborate with frontend teams using VueJS / ReactJS
- Design and optimize SQL databases
- Write clean, maintainable, and well-documented code
- Participate in code reviews and technical discussions`,
    requirements: `- Proficient in C# and .NET / ASP.NET framework
- Experience with RESTful API design
- Solid knowledge of SQL (query optimization, schema design)
- Familiar with VueJS or ReactJS is a plus
- Good communication and teamwork skills`,
    roadmap_path: "/roadmaps/2",
    source: "ITviec",
    source_url: "https://itviec.com/it-jobs/back-end",
  },
  {
    title: "Backend Developer (Java / Spring / Finance)",
    company: "Goline Corporation",
    location: "Hà Nội",
    skills: ["Java", "Maven", "AI", "Spring", "Oracle", "SQL"],
    job_type: "At office",
    description: `- Build and maintain backend systems for a securities/finance platform
- Develop microservices using Java Spring Framework
- Work with Oracle/SQL databases for financial data processing
- Integrate AI features into backend workflows
- Ensure high availability and performance of core systems`,
    requirements: `- 2+ years of experience with Java and Spring Framework
- Experience with Oracle or SQL databases
- Understanding of Maven build tools
- Interest in fintech / securities domain
- Ability to work in a fast-paced environment`,
    roadmap_path: "/roadmaps/2",
    source: "ITviec",
    source_url: "https://itviec.com/it-jobs/back-end",
  },
  {
    title: "Backend Developer (Golang / AWS / AI)",
    company: "ANDPAD VietNam Co., Ltd",
    location: "Hồ Chí Minh / Hà Nội",
    skills: ["Golang", "Design Systems", "Unit Test", "AI", "AWS", "English"],
    job_type: "Hybrid",
    description: `- Design and implement backend services using Golang
- Deploy and manage infrastructure on AWS
- Write unit tests and ensure code quality
- Integrate AI/ML features into product workflows
- Collaborate with cross-functional teams in English`,
    requirements: `- Proficient in Golang (1+ year hands-on)
- Experience with AWS services (EC2, S3, Lambda, etc.)
- Good understanding of unit testing best practices
- Business-level English communication
- Experience with AI integration is a plus`,
    roadmap_path: "/roadmaps/2",
    source: "ITviec",
    source_url: "https://itviec.com/it-jobs/back-end",
  },
  {
    title: "Backend Developer (Ruby on Rails / PostgreSQL)",
    company: "LIFULL Tech Vietnam",
    location: "Hồ Chí Minh",
    skills: ["Ruby", "PostgreSQL", "Ruby on Rails", "MySQL", "AI"],
    job_type: "At office",
    description: `- Develop and maintain web applications using Ruby on Rails
- Design and optimize PostgreSQL/MySQL databases
- Build RESTful APIs consumed by frontend teams
- Participate in Agile/Scrum development cycles
- Explore AI integration opportunities in product features`,
    requirements: `- 2+ years experience with Ruby on Rails
- Strong knowledge of PostgreSQL or MySQL
- Familiarity with RESTful API design
- Understanding of MVC architecture
- Passion for clean code and testing`,
    roadmap_path: "/roadmaps/2",
    source: "ITviec",
    source_url: "https://itviec.com/it-jobs/back-end",
  },
  {
    title: "Backend Developer (NodeJS / PostgreSQL / ExpressJS)",
    company: "OrgScale Recruitment",
    location: "Hà Nội",
    skills: ["NodeJS", "English", "PostgreSQL", "ExpressJS"],
    job_type: "At office",
    description: `- Build scalable REST APIs using NodeJS and ExpressJS
- Design and manage PostgreSQL databases
- Collaborate with frontend developers and product team
- Review code and uphold engineering best practices
- Communicate in English with international stakeholders`,
    requirements: `- 2+ years of NodeJS / ExpressJS experience
- Solid understanding of PostgreSQL
- Comfortable working in English (reading/writing)
- Experience with Git and collaborative workflows
- Knowledge of authentication patterns (JWT, OAuth) is a plus`,
    roadmap_path: "/roadmaps/2",
    source: "ITviec",
    source_url: "https://itviec.com/it-jobs/back-end",
  },
];

async function main() {
  const pool = new Pool({ connectionString: directUrl });
  const client = await pool.connect();

  try {
    console.log('🔄 Seeding jobs...');

    for (const job of JOBS) {
      // Upsert by title + company to be idempotent
      await client.query(`
        INSERT INTO jobs (title, company, location, description, requirements, skills, job_type, source, source_url, roadmap_path)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        job.title,
        job.company,
        job.location,
        job.description,
        job.requirements,
        job.skills,
        job.job_type,
        job.source,
        job.source_url,
        job.roadmap_path,
      ]);
      console.log(`  ✅ ${job.title} @ ${job.company}`);
    }

    const { rows } = await client.query('SELECT COUNT(*) FROM jobs');
    console.log(`\n🎉 Jobs seeded! Total jobs in DB: ${rows[0].count}`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));
