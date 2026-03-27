// apps/backend/tmp/repair-user.ts (Temporary)
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any });

async function main() {
  const userId = 'cmn475ljx0002u8r4pqbhrb2z'; // lenisha@iic.edu.np
  const customerId = 'cus_UCnUk56ENOPvRh';
  
  console.log(`Repairing User: ${userId} (${customerId})`);
  
  // 1. Get correct sub info from Stripe
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all' });
  const activeSub = subs.data.find(s => s.status === 'active' || s.status === 'trialing');
  
  if (!activeSub) {
    console.log('No active sub found in Stripe for this customer.');
    return;
  }
  
  console.log(`Found Active Sub in Stripe: ${activeSub.id}, status: ${activeSub.status}`);
  
  // 2. Force update DB
  const expiry = new Date((activeSub as any).current_period_end * 1000);
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isSubscribed: true,
      subscriptionExpiresAt: expiry,
      stripeCustomerId: customerId
    }
  });
  
  console.log(`DB UPDATED: ID: ${updatedUser.id}, isSubscribed: ${updatedUser.isSubscribed}, SubID in DB: ${updatedUser.stripeCustomerId}, Expiry: ${updatedUser.subscriptionExpiresAt}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
