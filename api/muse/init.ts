import { ensureMissionRow, ensureMuseRow, ensureSchema, getSql } from '../../lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, name } = req.body ?? {};
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  try {
    const sql = getSql();
    if (!sql) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    await ensureSchema();
    await ensureMuseRow(sql, address, name || 'My Muse');
    await ensureMissionRow(sql, address);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error init muse:', error);
    res.status(500).json({ error: 'Failed to init muse' });
  }
}
