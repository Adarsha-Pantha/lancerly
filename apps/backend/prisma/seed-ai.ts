import { PrismaClient } from '@prisma/client';
import { pipeline } from '@xenova/transformers';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Loading AI pipeline for embeddings...');
  // Initialize transformers pipeline exactly as AiService does
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });

  async function generateEmbedding(text: string): Promise<number[]> {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  console.log('Clearing existing AI seed data...');
  await prisma.project.deleteMany({ where: { title: { startsWith: '[Seed]' } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: 'seed_' } } });

  console.log('Creating clients...');
  const password = await bcrypt.hash('password123', 10);
  
  const client1 = await prisma.user.create({
    data: {
      email: 'seed_client1@example.com',
      password,
      role: 'CLIENT',
      profile: {
        create: {
          name: 'TechFlow Inc.',
          headline: 'Innovative Software Agency',
          bio: 'We build modern web applications.',
        }
      }
    }
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'seed_client2@example.com',
      password,
      role: 'CLIENT',
      profile: {
        create: {
          name: 'Global Marketing LLC',
          headline: 'Digital Marketing Experts',
          bio: 'We help brands grow their online presence.',
        }
      }
    }
  });

  console.log('Creating matching projects...');
  const projectsData = [
    {
      title: '[Seed] React & Node.js Developer Needed for SaaS',
      description: 'We need a senior full-stack developer to help us build a modern SaaS platform using React, Node.js, and PostgreSQL. Expected to know how to deploy on AWS.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      client: client1.id,
    },
    {
      title: '[Seed] Next.js Frontend Specialist',
      description: 'Looking for a UI/UX focused frontend engineer with strong React and Next.js skills to revamp our landing page and dashboard.',
      skills: ['React', 'Next.js', 'Tailwind', 'UI/UX'],
      client: client1.id,
    },
    {
      title: '[Seed] Need a simple WordPress blog',
      description: 'We need someone to install and configure a standard WordPress blog. No custom coding needed, just theme setup.',
      skills: ['WordPress', 'PHP', 'HTML'],
      client: client2.id,
    },
    {
      title: '[Seed] Marketing Content Writer',
      description: 'Looking for an experienced technical writer to create blog posts about modern software development trends.',
      skills: ['Writing', 'Content Strategy', 'SEO'],
      client: client2.id,
    }
  ];

  for (const p of projectsData) {
    console.log(`Generating embedding for project: ${p.title}`);
    const content = [p.title, p.description, p.skills.join(', ')].join('\n');
    const embedding = await generateEmbedding(content);

    await prisma.project.create({
      data: {
        title: p.title,
        description: p.description,
        skills: p.skills,
        clientId: p.client,
        budgetMin: 500,
        budgetMax: 2000,
        status: 'OPEN',
        projectType: 'CLIENT_REQUEST',
        moderationStatus: 'APPROVED',
        embedding,
      }
    });
  }

  console.log('Creating Freelancer for testing...');
  const freelancerBio = 'I am a highly experienced Full-Stack JavaScript Engineer specializing in React, Next.js, and Node.js. I love building scalable SaaS products and beautiful UIs.';
  const freelancerSkills = ['React', 'Node.js', 'Next.js', 'TypeScript', 'Tailwind'];
  
  const content = ['Senior React/Node Developer', freelancerBio, freelancerSkills.join(', ')].join('\n');
  const fEmbedding = await generateEmbedding(content);

  const freelancer = await prisma.user.create({
    data: {
      email: 'seed_freelancer@example.com',
      password,
      role: 'FREELANCER',
      profile: {
        create: {
          name: 'Jane Doe',
          headline: 'Senior React/Node Developer',
          bio: freelancerBio,
          skills: freelancerSkills,
          embedding: fEmbedding,
        }
      }
    }
  });

  console.log('✅ Seed data generated successfully!');
  console.log('--------------------------------------------------');
  console.log('Test Freelancer Account:');
  console.log('Email: seed_freelancer@example.com');
  console.log('Password: password123');
  console.log('--------------------------------------------------');
  console.log('Login as this freelancer on the frontend, and you should see the React/Node projects populate the AI Best Match pane!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
