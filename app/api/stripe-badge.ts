// pages/api/stripe-badge.ts
import type { NextApiRequest, NextApiResponse } from "next";

const BADGE_URL =
  "https://images.stripeassets.com/fzn2n1nzq965/4M6d6BSWzlgsrJx8rdZb0I/733f37ef69b5ca1d3d33e127184f4ce4/Powered_by_Stripe.svg?q=80&w=600";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await fetch(BADGE_URL, {
      // keep it simple; avoid referrer/CORS tangles
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!upstream.ok) {
      res.status(502).send("Badge unavailable");
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.status(200).send(buf);
  } catch {
    res.status(502).send("Badge unavailable");
  }
}
