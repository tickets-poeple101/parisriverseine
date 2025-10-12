import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.stripeassets.com",
      },
      {
        protocol: "https",
        hostname: "assets.stripeassets.com",
      },
      {
        protocol: "https",
        hostname: "stripe.com",
      },
    ],
  },

  async headers() {
    return [
      {
        // apply to every route
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // allow self-hosted and HTTPS images (needed for /api/pbadge + Stripe CDN)
            value:
              "default-src 'self'; img-src 'self' data: blob: https:; media-src 'none'; object-src 'none'; frame-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
