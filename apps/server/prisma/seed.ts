import 'dotenv/config';
import { PrismaClient, UserSkillStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is missing. Create apps/server/.env from .env.example first.',
  );
}

if (connectionString.includes('<') || connectionString.includes('>')) {
  throw new Error(
    'DATABASE_URL in apps/server/.env is still a placeholder. Replace it with a real PostgreSQL/Supabase connection string.',
  );
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (for idempotent seeding)
  console.log('Cleaning existing data...');
  await prisma.userSkillProgress.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.careerPath.deleteMany({});
  await prisma.user.deleteMany({});

  // 1️⃣ Create test user
  console.log('Creating test user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
    },
  });
  console.log(`✅ User created: ${user.email} (ID: ${user.id})`);

  // 2️⃣ Create Career Paths
  console.log('\nCreating career paths...');
  const backendPath = await prisma.careerPath.create({
    data: {
      name: 'Backend Developer',
      description: 'Learn backend technologies: Node.js, databases, APIs',
    },
  });
  console.log(`✅ CareerPath created: ${backendPath.name}`);

  const frontendPath = await prisma.careerPath.create({
    data: {
      name: 'Frontend Developer',
      description: 'Learn frontend technologies: React, TypeScript, CSS',
    },
  });
  console.log(`✅ CareerPath created: ${frontendPath.name}`);

  // 3️⃣ Create Roadmaps (1 per path, level = beginner)
  console.log('\nCreating roadmaps...');
  const backendRoadmap = await prisma.roadmap.create({
    data: {
      careerPathId: backendPath.id,
      level: 1, // beginner
    },
  });
  console.log(
    `✅ Roadmap created: Backend Beginner (ID: ${backendRoadmap.id})`,
  );

  const frontendRoadmap = await prisma.roadmap.create({
    data: {
      careerPathId: frontendPath.id,
      level: 1, // beginner
    },
  });
  console.log(
    `✅ Roadmap created: Frontend Beginner (ID: ${frontendRoadmap.id})`,
  );

  // 4️⃣ Create 6 Skills for Backend Beginner
  console.log('\nCreating skills for Backend Beginner roadmap...');
  const skillNames = [
    'Git',
    'Linux',
    'JavaScript',
    'Node.js',
    'Database',
    'REST API',
  ];
  const skills = [];

  for (let i = 0; i < skillNames.length; i++) {
    const skill = await prisma.skill.create({
      data: {
        roadmapId: backendRoadmap.id,
        name: skillNames[i],
        description: `Learn ${skillNames[i]} — foundational skill for backend development`,
        orderIndex: i + 1,
      },
    });
    skills.push(skill);
    console.log(`✅ Skill created: ${skill.name} (order: ${skill.orderIndex})`);
  }

  // 5️⃣ Create UserSkillProgress for test user (all NOT_STARTED)
  console.log('\nCreating user skill progress (all NOT_STARTED)...');
  for (const skill of skills) {
    const progress = await prisma.userSkillProgress.create({
      data: {
        userId: user.id,
        skillId: skill.id,
        status: UserSkillStatus.NOT_STARTED,
      },
    });
    console.log(`✅ Progress created: ${skill.name} → NOT_STARTED`);
  }

  // 6️⃣ Create 3 Skills for Frontend Beginner (minimal setup)
  console.log('\nCreating skills for Frontend Beginner roadmap...');
  const frontendSkills = [
    { name: 'HTML/CSS', description: 'Learn HTML and CSS — foundation of web' },
    {
      name: 'JavaScript',
      description: 'Learn vanilla JavaScript — core language',
    },
    { name: 'React', description: 'Learn React — popular frontend framework' },
  ];

  for (let i = 0; i < frontendSkills.length; i++) {
    const skill = await prisma.skill.create({
      data: {
        roadmapId: frontendRoadmap.id,
        name: frontendSkills[i].name,
        description: frontendSkills[i].description,
        orderIndex: i + 1,
      },
    });
    console.log(`✅ Skill created: ${skill.name} (order: ${skill.orderIndex})`);

    // Create progress for user
    await prisma.userSkillProgress.create({
      data: {
        userId: user.id,
        skillId: skill.id,
        status: UserSkillStatus.NOT_STARTED,
      },
    });
  }

  // === DEV C: Skills seed (remove temp CareerPath/Roadmap after Dev B merges) ===
  const devCTempCareerPathId = '11111111-1111-4111-8111-111111111111';
  const devCTempRoadmapId = '22222222-2222-4222-8222-222222222222';

  await prisma.careerPath.upsert({
    where: { id: devCTempCareerPathId },
    update: {
      name: 'Backend Developer',
      description: 'Lo trinh Backend (tam thoi do Dev C tao)',
    },
    create: {
      id: devCTempCareerPathId,
      name: 'Backend Developer',
      description: 'Lo trinh Backend (tam thoi do Dev C tao)',
    },
  });

  await prisma.roadmap.upsert({
    where: { id: devCTempRoadmapId },
    update: {
      careerPathId: devCTempCareerPathId,
      level: 1,
    },
    create: {
      id: devCTempRoadmapId,
      careerPathId: devCTempCareerPathId,
      level: 1,
    },
  });

  const devCSkills = [
    {
      id: '33333333-3333-4333-8333-333333333331',
      name: 'Git',
      orderIndex: 1,
      description: 'Version control co ban',
    },
    {
      id: '33333333-3333-4333-8333-333333333332',
      name: 'Linux',
      orderIndex: 2,
      description: 'Lenh terminal va he dieu hanh',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'JavaScript',
      orderIndex: 3,
      description: 'Ngon ngu lap trinh nen tang',
    },
    {
      id: '33333333-3333-4333-8333-333333333334',
      name: 'Node.js',
      orderIndex: 4,
      description: 'JavaScript phia server',
    },
    {
      id: '33333333-3333-4333-8333-333333333335',
      name: 'Database',
      orderIndex: 5,
      description: 'SQL va co so du lieu',
    },
    {
      id: '33333333-3333-4333-8333-333333333336',
      name: 'REST API',
      orderIndex: 6,
      description: 'Thiet ke va xay dung API',
    },
  ];

  for (const skill of devCSkills) {
    await prisma.skill.upsert({
      where: { id: skill.id },
      update: {
        roadmapId: devCTempRoadmapId,
        name: skill.name,
        description: skill.description,
        orderIndex: skill.orderIndex,
      },
      create: {
        id: skill.id,
        roadmapId: devCTempRoadmapId,
        name: skill.name,
        description: skill.description,
        orderIndex: skill.orderIndex,
      },
    });
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 1`);
  console.log(`   - CareerPaths: 2`);
  console.log(`   - Roadmaps: 2`);
  console.log(`   - Skills: 9 (6 Backend + 3 Frontend)`);
  console.log(`   - UserSkillProgress: 9`);
  console.log('\n🔐 Test credentials:');
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
