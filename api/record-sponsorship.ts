import { ensureMissionRow, ensureMuseRow, ensureSchema, getSql } from '../lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, amount } = req.body ?? {};
  if (!address || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Missing address or amount' });
  }

  try {
    const sql = getSql();
    if (!sql) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    await ensureSchema();
    await ensureMuseRow(sql, address);
    await ensureMissionRow(sql, address);

    await sql`
      INSERT INTO user_missions (
        user_address, ymp, daily_sponsorships, daily_amount, weekly_amount, total_amount
      )
      VALUES (${address}, 100, 1, ${amount}, ${amount}, ${amount})
      ON CONFLICT (user_address) DO UPDATE SET
        ymp = COALESCE(user_missions.ymp, 0) + 100,
        daily_sponsorships = COALESCE(user_missions.daily_sponsorships, 0) + 1,
        daily_amount = COALESCE(user_missions.daily_amount, 0) + ${amount},
        weekly_amount = COALESCE(user_missions.weekly_amount, 0) + ${amount},
        total_amount = COALESCE(user_missions.total_amount, 0) + ${amount}
    `;

    await sql`
      UPDATE muses SET
        exp = COALESCE(exp, 0) + 50,
        charm = COALESCE(charm, 10) + 1,
        talent = COALESCE(talent, 10) + 1,
        fanbase = COALESCE(fanbase, 10) + 1
      WHERE user_address = ${address}
    `;

    const [muse] = await sql`SELECT level, exp FROM muses WHERE user_address = ${address}`;
    if (muse && muse.exp >= 1000) {
      await sql`UPDATE muses SET level = COALESCE(level, 1) + 1, exp = COALESCE(exp, 0) - 1000 WHERE user_address = ${address}`;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error recording sponsorship:', error);
    res.status(500).json({ error: 'Failed to record sponsorship' });
  }
}
