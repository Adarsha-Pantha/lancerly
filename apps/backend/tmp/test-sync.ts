// apps/backend/tmp/test-sync.ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const USER_ID = 'cmn475ljx0002u8r4pqbhrb2z'; // lenisha@iic.edu.np

async function main() {
  console.log('--- DB MONITORING TEST ---');
  
  // 1. Initial State
  let user = await prisma.user.findUnique({ where: { id: USER_ID } });
  console.log(`Initial DB State: isSubscribed=${user?.isSubscribed}`);
  
  // 2. Monitoring
  console.log('Monitoring DB for 60 seconds (checking every 5s)...');
  for (let i = 0; i < 12; i++) {
    user = await prisma.user.findUnique({ where: { id: USER_ID } });
    console.log(`[${new Date().toLocaleTimeString()}] DB State: isSubscribed=${user?.isSubscribed}`);
    await new Promise(r => setTimeout(r, 5000));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
