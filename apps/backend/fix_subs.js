const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.user.updateMany({
      where: { role: 'CLIENT' },
      data: { isSubscribed: true }
    });
    console.log(`Updated ${res.count} clients to Pro status.`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
