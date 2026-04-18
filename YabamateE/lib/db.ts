import { neon } from '@neondatabase/serverless';
import { MOCK_CREATORS } from '../src/constants';

export type SqlClient = ReturnType<typeof neon>;

let cachedUrl: string | null = null;
let cachedSql: SqlClient | null = null;

export function getSql(): SqlClient | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  if (!cachedSql || cachedUrl !== url) {
    cachedUrl = url;
    cachedSql = neon(url);
  }

  return cachedSql;
}

export const DEFAULT_GAMES_PLAYED = {
  pong: false,
  tetris: false,
  reversi: false,
  backgammon: false,
};

const DEFAULT_GAMES_PLAYED_JSON = '{"pong":false,"tetris":false,"reversi":false,"backgammon":false}';

export async function ensureSchema(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  await sql`
    CREATE TABLE IF NOT EXISTS creators (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT NOT NULL,
      description TEXT,
      avatar TEXT,
      cover TEXT,
      subscribers INTEGER DEFAULT 0,
      tiers JSONB
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
      games_played JSONB DEFAULT ${DEFAULT_GAMES_PLAYED_JSON}::jsonb,
      last_check_date DATE DEFAULT CURRENT_DATE
    )
  `;

  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS id TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS name TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS handle TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS avatar TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS cover TEXT`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS subscribers INTEGER DEFAULT 0`;
  await sql`ALTER TABLE creators ADD COLUMN IF NOT EXISTS tiers JSONB`;

  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS user_address TEXT`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'My Muse'`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS charm INTEGER DEFAULT 10`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS talent INTEGER DEFAULT 10`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS fanbase INTEGER DEFAULT 10`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS skin_id TEXT DEFAULT 'casual_1'`;
  await sql`ALTER TABLE muses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS user_address TEXT`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS ymp INTEGER DEFAULT 0`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS daily_sponsorships INTEGER DEFAULT 0`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS daily_amount NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS weekly_amount NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS games_played JSONB DEFAULT ${DEFAULT_GAMES_PLAYED_JSON}::jsonb`;
  await sql`ALTER TABLE user_missions ADD COLUMN IF NOT EXISTS last_check_date DATE DEFAULT CURRENT_DATE`;

  return true;
}

export async function seedCreators(sql: SqlClient) {
  for (const creator of MOCK_CREATORS) {
    await sql`
      INSERT INTO creators (id, name, handle, description, avatar, cover, subscribers, tiers)
      VALUES (
        ${creator.id},
        ${creator.name},
        ${creator.handle},
        ${creator.description},
        ${creator.avatar},
        ${creator.cover},
        ${creator.subscribers},
        ${JSON.stringify(creator.tiers)}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        handle = EXCLUDED.handle,
        description = EXCLUDED.description,
        avatar = EXCLUDED.avatar,
        cover = EXCLUDED.cover,
        subscribers = EXCLUDED.subscribers,
        tiers = EXCLUDED.tiers
    `;
  }
}

export async function ensureMuseRow(sql: SqlClient, address: string, name = 'My Muse') {
  await sql`
    INSERT INTO muses (
      user_address, name, level, exp, charm, talent, fanbase, skin_id
    )
    VALUES (${address}, ${name}, 1, 0, 10, 10, 10, 'casual_1')
    ON CONFLICT (user_address) DO NOTHING
  `;
}

export async function ensureMissionRow(sql: SqlClient, address: string) {
  await sql`
    INSERT INTO user_missions (
      user_address,
      ymp,
      daily_sponsorships,
      daily_amount,
      weekly_amount,
      total_amount,
      games_played,
      last_check_date
    )
    VALUES (
      ${address},
      0,
      0,
      0,
      0,
      0,
      ${DEFAULT_GAMES_PLAYED_JSON}::jsonb,
      CURRENT_DATE
    )
    ON CONFLICT (user_address) DO NOTHING
  `;
}
