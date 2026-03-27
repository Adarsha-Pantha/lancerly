import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { attachmentUrl: { not: null } },
        { attachmentName: { not: null } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('Messages with attachments:', JSON.stringify(messages, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
