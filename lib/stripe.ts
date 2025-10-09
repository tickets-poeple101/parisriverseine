// lib/stripe.ts
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Don't crash module import during build; crash only at request time if actually used
    throw new Error("STRIPE_SECRET_KEY is missing. Set it in Vercel → Project → Settings → Environment Variables.");
  }

  _stripe = new Stripe(key);
  return _stripe;
}
