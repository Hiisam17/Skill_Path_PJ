const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true }
  });
  console.log(JSON.stringify(jobs, null, 2));
}

main().finally(() => prisma.$disconnect());
