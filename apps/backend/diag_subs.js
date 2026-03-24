const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, email: true, isSubscribed: true, stripeCustomerId: true }
    });
    console.log('--- Client States ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error fetching users:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
