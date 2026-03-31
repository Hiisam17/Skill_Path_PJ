import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  console.log('Cleaning existing data...');
  // Delete in correct order to avoid foreign key constraints violations
  await prisma.userSkillProgress.deleteMany({});
  await prisma.roadmapSkill.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.roadmapSection.deleteMany({});
  await prisma.userRoadmap.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.careerPath.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.progressStatus.deleteMany({});
  await prisma.skillLevel.deleteMany({});

  console.log('Creating master data...');
  const statusNotStarted = await prisma.progressStatus.create({ data: { name: 'NOT_STARTED' } });
  const statusInProgress = await prisma.progressStatus.create({ data: { name: 'IN_PROGRESS' } });
  const statusCompleted = await prisma.progressStatus.create({ data: { name: 'COMPLETED' } });

  const beginnerLevel = await prisma.skillLevel.create({ data: { name: 'Beginner' } });

  // 1️⃣ Create test profile con hồ
  console.log('Creating test profile...');
  const userId = '01cbcd3c-05c8-46cf-b807-4b913656ca4b'; // Trùng với mockUserId trong controller
  const profile = await prisma.profile.create({
    data: {
      userId,
      fullName: 'Test User',
      streakCount: 0,
    },
  });
  console.log(`✅ Profile created: ${profile.fullName} (ID: ${profile.userId})`);

  // 2️⃣ Create Career Paths
  console.log('\nCreating career paths...');
  const backendPath = await prisma.careerPath.create({
    data: {
      name: 'Backend Developer',
      description: 'Learn backend technologies: Node.js, databases, APIs',
    },
  });
  const frontendPath = await prisma.careerPath.create({
    data: {
      name: 'Frontend Developer',
      description: 'Learn frontend technologies: React, TypeScript, CSS',
    },
  });

  // 3️⃣ Create Roadmaps
  console.log('\nCreating roadmaps...');
  const backendRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Backend Beginner Roadmap',
      careerPathId: backendPath.id,
      isPublished: true,
      estimatedTotalHours: 40,
    },
  });
  const frontendRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Frontend Beginner Roadmap',
      careerPathId: frontendPath.id,
      isPublished: true,
      estimatedTotalHours: 40,
    },
  });

  // Create Roadmap Sections
  const backendSection = await prisma.roadmapSection.create({
    data: {
      roadmapId: backendRoadmap.id,
      title: 'Backend Fundamentals',
      sortOrder: 1,
    }
  });

  const frontendSection = await prisma.roadmapSection.create({
    data: {
      roadmapId: frontendRoadmap.id,
      title: 'Frontend Fundamentals',
      sortOrder: 1,
    }
  });

  // 4️⃣ Create Skills for Backend Beginner
  console.log('\nCreating skills for Backend Beginner roadmap...');
  const skillNames = ['Git', 'Linux', 'JavaScript', 'Node.js', 'Database', 'REST API'];
  const skills = [];

  for (let i = 0; i < skillNames.length; i++) {
    const skill = await prisma.skill.create({
      data: {
        name: skillNames[i],
        description: `Learn ${skillNames[i]} — foundational skill for backend development`,
        levelId: beginnerLevel.id,
      },
    });
    skills.push(skill);

    // Link skill to roadmap section
    await prisma.roadmapSkill.create({
      data: {
        sectionId: backendSection.id,
        skillId: skill.id,
        isOptional: false,
      }
    });

    // Create progress for user
    await prisma.userSkillProgress.create({
      data: {
        userId: profile.userId,
        skillId: skill.id,
        statusId: statusNotStarted.id,
      },
    });

    console.log(`✅ Skill created & mapped: ${skill.name}`);
  }

  console.log('\nCreating skills for Frontend Beginner roadmap...');
  const frontendSkills = [
    { name: 'HTML/CSS', description: 'Learn HTML and CSS — foundation of web' },
    { name: 'DOM Manipulation', description: 'Learn vanilla JavaScript DOM UI' },
    { name: 'React', description: 'Learn React — popular frontend framework' },
  ];

  for (let i = 0; i < frontendSkills.length; i++) {
    const skill = await prisma.skill.create({
      data: {
        name: frontendSkills[i].name,
        description: frontendSkills[i].description,
        levelId: beginnerLevel.id,
      },
    });

    await prisma.roadmapSkill.create({
      data: {
        sectionId: frontendSection.id,
        skillId: skill.id,
        isOptional: false,
      }
    });

    await prisma.userSkillProgress.create({
      data: {
        userId: profile.userId,
        skillId: skill.id,
        statusId: statusNotStarted.id,
      },
    });
    console.log(`✅ Skill created & mapped: ${skill.name}`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Profiles: 1`);
  console.log(`   - CareerPaths: 2`);
  console.log(`   - Roadmaps: 2`);
  console.log(`   - Skills: 9`);
  console.log(`   - UserSkillProgress: 9`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });