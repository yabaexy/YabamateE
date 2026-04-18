import { sql } from './db';

export default async function handler(req, res) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS creators (
        id TEXT PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        handle TEXT NOT NULL
      )
    `;
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'DB init failed' });
  }
}
