// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.stripeassets.com" },
      { protocol: "https", hostname: "assets.stripeassets.com" },
      { protocol: "https", hostname: "stripe.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" }, // for the CDN icons if used
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
