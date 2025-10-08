import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error("❌ Missing STRIPE_SECRET_KEY. Put it in /.env.local and restart dev.");
  throw new Error("Missing STRIPE_SECRET_KEY");
}

console.log("✅ Stripe key loaded (starts with):", key.slice(0, 8)); // should print sk_test_

export const stripe = new Stripe(key, {
  apiVersion: "2024-06-20" as any,
});
