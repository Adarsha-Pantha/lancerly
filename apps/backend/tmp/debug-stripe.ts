// apps/backend/tmp/debug-stripe.ts (Temporary)
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any });

async function check(cid: string) {
  console.log(`Checking Customer: ${cid}`);
  try {
    const subs = await stripe.subscriptions.list({ customer: cid, status: 'all' });
    console.log(`Found ${subs.data.length} subs.`);
    subs.data.forEach(s => {
      console.log(`  SubID: ${s.id}, Status: ${s.status}, Product: ${s.items.data[0].price.product}`);
    });
  } catch (e: any) {
    console.error(`  Error: ${e.message}`);
  }
}

async function main() {
  await check('cus_UCnFFbJ1PBxcjb');
  await check('cus_UCmgzjLv14x76T');
  await check('cus_UCnUk56ENOPvRh');
}

main().catch(console.error);
