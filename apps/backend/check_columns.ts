import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Attempt to query the fields directly
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Message'
    `;
    console.log('Message table columns:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error querying columns:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
