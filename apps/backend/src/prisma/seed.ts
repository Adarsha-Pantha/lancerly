import { PrismaClient, Role, ProjectType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create a dummy client and freelancer if they don't exist
  const hashedPassword = await bcrypt.hash('password123', 10);

  const client = await prisma.user.upsert({
    where: { email: 'client@lancerly.com' },
    update: {},
    create: {
      email: 'client@lancerly.com',
      password: hashedPassword,
      role: Role.CLIENT,
      profile: {
        create: {
          name: 'Global Tech Corp',
          headline: 'Leading Enterprise Solutions',
          bio: 'We hire the best to build the future.',
          country: 'USA',
        },
      },
    },
  });

  const freelancer = await prisma.user.upsert({
    where: { email: 'freelancer@lancerly.com' },
    update: {},
    create: {
      email: 'freelancer@lancerly.com',
      password: hashedPassword,
      role: Role.FREELANCER,
      profile: {
        create: {
          name: 'Alex Developer',
          headline: 'Full Stack Wizard',
          bio: '10 years of experience in Web & Mobile.',
          country: 'Canada',
        },
      },
    },
  });

  console.log('Users created or found.');

  // 2. Clear existing demo data (Optional: only if you want a clean slate for AI)
  // await prisma.project.deleteMany({ where: { title: { contains: '[SEED]' } } });

  const historicalData = [
    {
      title: '[SEED] React E-commerce Platform',
      description: 'Built a full-scale e-commerce site with product management, stripe integration, and auth.',
      skills: ['React', 'Node.js', 'Stripe', 'Tailwind'],
      budgetMin: 3000,
      budgetMax: 5000,
      agreedBudget: 4200,
      durationDays: 45,
    },
    {
      title: '[SEED] Mobile Fitness Tracker',
      description: 'iOS and Android app for tracking workouts and sharing with friends.',
      skills: ['React Native', 'Firebase', 'TypeScript'],
      budgetMin: 4000,
      budgetMax: 7000,
      agreedBudget: 6500,
      durationDays: 60,
    },
    {
      title: '[SEED] SaaS Landing Page',
      description: 'High converting landing page with modern animations and SEO optimization.',
      skills: ['Next.js', 'Framer Motion', 'SEO'],
      budgetMin: 800,
      budgetMax: 1500,
      agreedBudget: 1200,
      durationDays: 10,
    },
    {
      title: '[SEED] Python Data Scraper',
      description: 'Custom scraper to collect real estate data from multiple sources.',
      skills: ['Python', 'BeautifulSoup', 'Pandas'],
      budgetMin: 500,
      budgetMax: 1000,
      agreedBudget: 750,
      durationDays: 7,
    },
    {
      title: '[SEED] AI Chatbot Integration',
      description: 'Integrated OpenAI API into a customer support dashboard.',
      skills: ['OpenAI', 'Node.js', 'React'],
      budgetMin: 2000,
      budgetMax: 4000,
      agreedBudget: 3500,
      durationDays: 21,
    },
    {
      title: '[SEED] Graphic Design: Logo & Brand Kit',
      description: 'Designing a modern logo and comprehensive brand identity for a startup.',
      skills: ['Adobe Illustrator', 'Branding', 'Design'],
      budgetMin: 1000,
      budgetMax: 2000,
      agreedBudget: 1500,
      durationDays: 14,
    },
    {
      title: '[SEED] Technical Documentation Writing',
      description: 'Writing 50 pages of technical API documentation for a fintech startup.',
      skills: ['Technical Writing', 'API', 'Markdown'],
      budgetMin: 1500,
      budgetMax: 3000,
      agreedBudget: 2200,
      durationDays: 30,
    },
    {
      title: '[SEED] WordPress Multi-site Setup',
      description: 'Configuring a WordPress multi-site network for a marketing agency.',
      skills: ['WordPress', 'PHP', 'MySQL'],
      budgetMin: 1200,
      budgetMax: 2500,
      agreedBudget: 1800,
      durationDays: 15,
    },
  ];

  for (const data of historicalData) {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        skills: data.skills,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        status: 'COMPLETED',
        clientId: client.id,
        projectType: ProjectType.CLIENT_REQUEST,
      },
    });

    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        freelancerId: freelancer.id,
        coverLetter: 'I can do this!',
        proposedBudget: data.agreedBudget,
        status: 'ACCEPTED',
      },
    });

    await prisma.contract.create({
      data: {
        projectId: project.id,
        proposalId: proposal.id,
        clientId: client.id,
        freelancerId: freelancer.id,
        agreedBudget: data.agreedBudget,
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (data.durationDays + 5)),
        endDate: new Date(),
      },
    });

    console.log(`Created project and contract: ${project.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
