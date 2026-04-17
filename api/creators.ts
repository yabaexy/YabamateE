import { ensureSchema, getSql, seedCreators } from '../lib/db';

export default async function handler(req: any, res: any) {
  try {
    const sql = getSql();
    if (!sql) {
      return res.status(200).json({ creators: [] });
    }

    await ensureSchema();

    let creators = await sql`
      SELECT id, name, handle, description, avatar, cover, subscribers, tiers
      FROM creators
      ORDER BY subscribers DESC, name ASC
    `;

    if (!creators || creators.length === 0) {
      await seedCreators(sql);
      creators = await sql`
        SELECT id, name, handle, description, avatar, cover, subscribers, tiers
        FROM creators
        ORDER BY subscribers DESC, name ASC
      `;
    }

    res.status(200).json({ creators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
}
