import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.disputeEvidence.count();
  const evidence = await prisma.disputeEvidence.findMany({
    take: 5,
    include: {
      dispute: { select: { title: true } },
      uploadedBy: { select: { email: true } },
    },
  });
  console.log(`Total Evidence Records: ${count}`);
  console.log(JSON.stringify(evidence, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
