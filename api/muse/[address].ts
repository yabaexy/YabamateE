import { ensureSchema, getSql } from '../../lib/db';

export default async function handler(req: any, res: any) {
  try {
    const sql = getSql();
    if (!sql) {
      return res.status(200).json({ muse: null, stats: null });
    }

    await ensureSchema();

    const { address } = req.query;
    if (!address || Array.isArray(address)) {
      return res.status(400).json({ error: 'Missing address' });
    }

    const [muse] = await sql`
      SELECT * FROM muses WHERE user_address = ${address}
    `;
    const [stats] = await sql`
      SELECT * FROM user_missions WHERE user_address = ${address}
    `;

    res.status(200).json({ muse: muse || null, stats: stats || null });
  } catch (error) {
    console.error('Error fetching muse:', error);
    res.status(500).json({ error: 'Failed to fetch muse' });
  }
}
