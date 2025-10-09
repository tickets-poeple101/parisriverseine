// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_BASE_URL: string;
    N8N_WEBHOOK_URL: string;
    N8N_SHARED_SECRET: string;
  }
}

