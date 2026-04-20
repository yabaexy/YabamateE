import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// High-level tuning:
// - reuse the client per function instance
// - use the pooled URL in Vercel (add -pooler in Neon dashboard)
// - prioritize faster fetches for one-shot queries
export const sql = neon(databaseUrl, {
  fetchOptions: { priority: 'high' },
});
