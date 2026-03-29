const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { email: true, isSubscribed: true, stripeCustomerId: true }
    });
    console.log('--- Client Data ---');
    clients.forEach(c => {
      console.log(`Email: ${c.email} | Subscribed: ${c.isSubscribed} | StripeID: ${c.stripeCustomerId}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
