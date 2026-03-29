import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, email: true, isSubscribed: true, stripeCustomerId: true }
  });
  console.log('Before update:', JSON.stringify(users, null, 2));

  for (const user of users) {
    if (user.stripeCustomerId && !user.isSubscribed) {
      console.log(`Updating user ${user.email} to subscribed...`);
      await prisma.user.update({
        where: { id: user.id },
        data: { isSubscribed: true }
      });
    }
  }

  const updatedUsers = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, email: true, isSubscribed: true, stripeCustomerId: true }
  });
  console.log('After update:', JSON.stringify(updatedUsers, null, 2));

  await prisma.$disconnect();
}

main();
