import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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

async function syncIdSequence(tableName: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('public.${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM public.${tableName}), 0) + 1, false);`,
  );
}

async function main() {
  console.log('Starting Supabase-compatible seed...');

  const sequenceTables = [
    'progress_statuses',
    'skill_levels',
    'careers',
    'roadmaps',
    'roadmap_sections',
    'skills',
    'roadmap_skills',
    'user_roadmaps',
    'user_skill_progress',
  ];

  for (const tableName of sequenceTables) {
    await syncIdSequence(tableName);
  }

  const demoUserId =
    process.env.DEMO_USER_ID ?? '11111111-1111-4111-8111-111111111111';

  const notStartedStatus = await prisma.progressStatus.upsert({
    where: { name: 'NOT_STARTED' },
    update: {},
    create: { name: 'NOT_STARTED' },
  });
  const inProgressStatus = await prisma.progressStatus.upsert({
    where: { name: 'IN_PROGRESS' },
    update: {},
    create: { name: 'IN_PROGRESS' },
  });
  const completedStatus = await prisma.progressStatus.upsert({
    where: { name: 'COMPLETED' },
    update: {},
    create: { name: 'COMPLETED' },
  });

  const beginnerLevel = await prisma.skillLevel.upsert({
    where: { name: 'Beginner' },
    update: {},
    create: { name: 'Beginner' },
  });

  const backendCareer = await prisma.careerPath.upsert({
    where: { name: 'Backend Developer' },
    update: { description: 'Backend engineering roadmap' },
    create: {
      name: 'Backend Developer',
      description: 'Backend engineering roadmap',
    },
  });

  const roadmapTitle = 'Backend Beginner';
  const existingRoadmap = await prisma.roadmap.findFirst({
    where: {
      title: roadmapTitle,
      careerPathId: backendCareer.id,
    },
  });

  const backendRoadmap =
    existingRoadmap ??
    (await prisma.roadmap.create({
      data: {
        title: roadmapTitle,
        description: 'Core backend path for beginners',
        careerPathId: backendCareer.id,
        isPublished: true,
        estimatedTotalHours: 40,
      },
    }));

  const existingSection = await prisma.roadmapSection.findFirst({
    where: {
      roadmapId: backendRoadmap.id,
      title: 'Core Skills',
    },
  });

  const coreSection =
    existingSection ??
    (await prisma.roadmapSection.create({
      data: {
        roadmapId: backendRoadmap.id,
        title: 'Core Skills',
        description: 'Essential backend fundamentals',
        sortOrder: 1,
      },
    }));

  const skillNames = [
    'Git',
    'Linux',
    'JavaScript',
    'Node.js',
    'Database',
    'REST API',
  ];

  for (let index = 0; index < skillNames.length; index += 1) {
    const skillName = skillNames[index];

    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      update: {
        description: `${skillName} fundamentals for backend development`,
        levelId: beginnerLevel.id,
      },
      create: {
        name: skillName,
        description: `${skillName} fundamentals for backend development`,
        levelId: beginnerLevel.id,
      },
    });

    await prisma.roadmapSkill.upsert({
      where: {
        sectionId_stepNumber: {
          sectionId: coreSection.id,
          stepNumber: index + 1,
        },
      },
      update: {
        skillId: skill.id,
        isOptional: false,
        estimatedHours: 4,
      },
      create: {
        sectionId: coreSection.id,
        skillId: skill.id,
        stepNumber: index + 1,
        isOptional: false,
        estimatedHours: 4,
      },
    });
  }

  await prisma.profile.upsert({
    where: { userId: demoUserId },
    update: {
      fullName: 'Demo User',
      isDeleted: false,
      lastActivityAt: new Date(),
    },
    create: {
      userId: demoUserId,
      fullName: 'Demo User',
      isDeleted: false,
      lastActivityAt: new Date(),
    },
  });

  await prisma.userRoadmap.upsert({
    where: {
      userId_roadmapId: {
        userId: demoUserId,
        roadmapId: backendRoadmap.id,
      },
    },
    update: {},
    create: {
      userId: demoUserId,
      roadmapId: backendRoadmap.id,
      currentStepOrder: 1,
      progressPercentage: 0,
    },
  });

  const orderedRoadmapSkills = await prisma.roadmapSkill.findMany({
    where: {
      section: {
        roadmapId: backendRoadmap.id,
      },
      skillId: { not: null },
    },
    orderBy: { stepNumber: 'asc' },
    select: { skillId: true, stepNumber: true },
  });

  for (const roadmapSkill of orderedRoadmapSkills) {
    if (!roadmapSkill.skillId) continue;

    const statusId =
      roadmapSkill.stepNumber <= 1
        ? completedStatus.id
        : roadmapSkill.stepNumber <= 3
          ? inProgressStatus.id
          : notStartedStatus.id;

    await prisma.userSkillProgress.upsert({
      where: {
        userId_skillId: {
          userId: demoUserId,
          skillId: roadmapSkill.skillId,
        },
      },
      update: {
        statusId,
        completedAt:
          statusId === completedStatus.id ? new Date() : null,
      },
      create: {
        userId: demoUserId,
        skillId: roadmapSkill.skillId,
        statusId,
        completedAt:
          statusId === completedStatus.id ? new Date() : null,
      },
    });
  }

  console.log('Seed completed.');
  console.log(`Demo user id: ${demoUserId}`);
  console.log(`Roadmap id: ${backendRoadmap.id}`);
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
