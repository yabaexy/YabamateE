import { DEFAULT_GAMES_PLAYED, ensureMissionRow, ensureMuseRow, ensureSchema, getSql } from '../lib/db';

type GameType = keyof typeof DEFAULT_GAMES_PLAYED;

function normalizeGamesPlayed(value: any): Record<GameType, boolean> {
  if (!value) return { ...DEFAULT_GAMES_PLAYED };
  if (typeof value === 'string') {
    try {
      return { ...DEFAULT_GAMES_PLAYED, ...JSON.parse(value) };
    } catch {
      return { ...DEFAULT_GAMES_PLAYED };
    }
  }
  return { ...DEFAULT_GAMES_PLAYED, ...value };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, gameId } = req.body ?? {};
  if (!address || !gameId || !(gameId in DEFAULT_GAMES_PLAYED)) {
    return res.status(400).json({ error: 'Missing address or invalid gameId' });
  }

  try {
    const sql = getSql();
    if (!sql) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    await ensureSchema();
    await ensureMuseRow(sql, address);
    await ensureMissionRow(sql, address);

    const [stats] = await sql`
      SELECT games_played, last_check_date
      FROM user_missions
      WHERE user_address = ${address}
    `;

    let gamesPlayed = normalizeGamesPlayed(stats?.games_played);
    const today = new Date().toISOString().split('T')[0];
    const lastDate = stats?.last_check_date ? new Date(stats.last_check_date).toISOString().split('T')[0] : today;

    if (today !== lastDate) {
      gamesPlayed = { ...DEFAULT_GAMES_PLAYED };
    }

    if (!gamesPlayed[gameId as GameType]) {
      gamesPlayed[gameId as GameType] = true;

      const allPlayed = Object.values(gamesPlayed).every(Boolean);
      const reward = allPlayed ? 200 : 0;

      await sql`
        UPDATE user_missions SET
          games_played = ${JSON.stringify(gamesPlayed)}::jsonb,
          ymp = COALESCE(ymp, 0) + ${reward},
          last_check_date = CURRENT_DATE
        WHERE user_address = ${address}
      `;

      await sql`
        UPDATE muses
        SET exp = COALESCE(exp, 0) + 10
        WHERE user_address = ${address}
      `;

      return res.status(200).json({ success: true, reward, allPlayed });
    }

    res.status(200).json({ success: true, reward: 0, allPlayed: false });
  } catch (error) {
    console.error('Error recording game:', error);
    res.status(500).json({ error: 'Failed to record game' });
  }
}
