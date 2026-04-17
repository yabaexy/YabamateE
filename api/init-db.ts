import { ensureSchema, getSql, seedCreators } from '../lib/db';

export default async function handler(req: any, res: any) {
  try {
    const sql = getSql();
    if (!sql) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    await ensureSchema();
    await seedCreators(sql);

    res.status(200).json({ ok: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Error initializing DB:', error);
    res.status(500).json({ error: 'DB init failed' });
  }
}
