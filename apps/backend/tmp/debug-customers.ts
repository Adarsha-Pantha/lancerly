// apps/backend/tmp/debug-customers.ts (Temporary)
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' as any });

async function main() {
  const email = 'lenisha@iic.edu.np';
  console.log(`Searching for all Stripe customers with email: ${email}`);
  
  const customers = await stripe.customers.list({ email });
  console.log(`Found ${customers.data.length} customers.`);
  
  for (const c of customers.data) {
    console.log(`Customer: ${c.id}, Email: ${c.email}, Created: ${new Date(c.created * 1000)}`);
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all' });
    console.log(`  Subs found: ${subs.data.length}`);
    subs.data.forEach(s => {
      console.log(`    SubID: ${s.id}, Status: ${s.status}, Created: ${new Date(s.created * 1000)}`);
    });
  }
}

main().catch(console.error);
