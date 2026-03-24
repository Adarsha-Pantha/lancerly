import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, email: true, isSubscribed: true, stripeCustomerId: true }
  });
  console.log('Clients:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main();
