import { sql } from './db';

export default async function handler(req: any, res: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS creators (
        id TEXT PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        handle TEXT NOT NULL,
        description TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        cover TEXT DEFAULT '',
        subscribers INTEGER DEFAULT 0,
        tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS muses (
        user_address TEXT PRIMARY KEY,
        name TEXT DEFAULT 'My Muse',
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        charm INTEGER DEFAULT 10,
        talent INTEGER DEFAULT 10,
        fanbase INTEGER DEFAULT 10,
        skin_id TEXT DEFAULT 'casual_1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_missions (
        user_address TEXT PRIMARY KEY,
        ymp INTEGER DEFAULT 0,
        daily_sponsorships INTEGER DEFAULT 0,
        daily_amount NUMERIC DEFAULT 0,
        weekly_amount NUMERIC DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        games_played JSONB DEFAULT '{"pong": false, "tetris": false, "reversi": false, "backgammon": false}',
        last_check_date DATE DEFAULT CURRENT_DATE
      )
    `;

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('DB init failed:', error);
    res.status(500).json({ error: 'DB init failed' });
  }
}
