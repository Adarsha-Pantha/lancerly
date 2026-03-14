import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFreelancers() {
  const freelancers = await prisma.user.findMany({
    where: { role: 'FREELANCER' },
    include: { profile: true },
  });

  console.log('Freelancers Onboarding Status:');
  freelancers.forEach((f) => {
    console.log(`- ${f.email}: ${f.profile?.stripeAccountId ? 'Onboarded (' + f.profile.stripeAccountId + ')' : 'NOT Onboarded'}`);
  });
}

checkFreelancers()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
