import { ensureMuseRow, ensureSchema, getSql } from '../../lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, name } = req.body ?? {};
  if (!address || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Missing address or name' });
  }

  try {
    const sql = getSql();
    if (!sql) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    await ensureSchema();
    await ensureMuseRow(sql, address, name.trim());

    await sql`
      UPDATE muses
      SET name = ${name.trim()}
      WHERE user_address = ${address}
    `;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating muse name:', error);
    res.status(500).json({ error: 'Failed to update name' });
  }
}
