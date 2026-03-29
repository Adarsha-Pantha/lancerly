// apps/backend/tmp/global-sync.ts
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any });

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { contains: 'lenisha', mode: 'insensitive' }
    }
  });
  
  console.log(`Found ${users.length} matching users. Syncing all...`);
  
  for (const user of users) {
    console.log(`Syncing ${user.email} (Cust: ${user.stripeCustomerId})...`);
    if (!user.stripeCustomerId) {
      console.log(`  Skipping ${user.email} - No Stripe Customer ID.`);
      continue;
    }
    
    try {
      const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: 'all' });
      // Filter for active or trialing
      const activeOrTrialing = subs.data.filter(s => s.status === 'active' || s.status === 'trialing');
      
      if (activeOrTrialing.length > 0) {
        // Sort by created descending
        const newest = activeOrTrialing.sort((a, b) => b.created - a.created)[0];
        // Cast to any to avoid TS errors with current_period_end if needed
        const periodEnd = (newest as any).current_period_end;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isSubscribed: true,
            subscriptionExpiresAt: new Date(periodEnd * 1000)
          }
        });
        console.log(`  UPDATED ${user.email} to Pros! (Sub: ${newest.id})`);
      } else {
        // Only set to false if it was true before, to avoid unnecessary updates
        if (user.isSubscribed) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isSubscribed: false, subscriptionExpiresAt: null }
          });
          console.log(`  SET ${user.email} to Free (no active subs).`);
        } else {
          console.log(`  ${user.email} is already Free.`);
        }
      }
    } catch (e: any) {
      console.error(`  Error syncing ${user.email}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
