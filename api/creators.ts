import { sql } from './db.js';

export default async function handler(req: any, res: any) {
  try {
    const creators = await sql`
      SELECT id, wallet_address, name, handle, description, avatar, cover, subscribers, tiers
      FROM creators
      ORDER BY COALESCE(subscribers, 0) DESC, name ASC
    `;

    const normalized = creators.map((c: any) => ({
      ...c,
      tiers: Array.isArray(c.tiers) ? c.tiers : (c.tiers ?? []),
    }));

    res.status(200).json({ creators: normalized });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
}
