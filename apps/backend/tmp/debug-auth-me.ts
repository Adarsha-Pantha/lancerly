// apps/backend/tmp/debug-auth-me.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'lancerly-super-secret-jwt-key-change-in-production';
const USER_ID = 'cmn475ljx0002u8r4pqbhrb2z'; // lenisha@iic.edu.np

async function main() {
  console.log('--- DEBUG AUTH ME ---');
  
  // 1. Get user from DB
  const u = await prisma.user.findUnique({
    where: { id: USER_ID },
    include: { profile: true }
  });
  
  if (!u) {
    console.log('User not found!');
    return;
  }
  
  console.log('DB USER OBJECT:');
  console.log(`- ID: ${u.id}`);
  console.log(`- email: ${u.email}`);
  console.log(`- isSubscribed (raw): ${u.isSubscribed} (type: ${typeof u.isSubscribed})`);
  
  // 2. Simulate flattenUser
  const flattened = {
    id: u.id,
    email: u.email,
    role: u.role,
    isSubscribed: u.isSubscribed ?? false,
    name: u.profile?.name ?? null,
  };
  
  console.log('FLATTENED RESPONSE:');
  console.log(JSON.stringify(flattened, null, 2));
  console.log(`- isSubscribed in response: ${flattened.isSubscribed} (type: ${typeof flattened.isSubscribed})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
