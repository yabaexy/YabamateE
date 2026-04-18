import { sql } from '../db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const c = req.body;
    await sql`
      INSERT INTO creators (id, wallet_address, name, handle)
      VALUES (${c.id}, ${c.wallet_address}, ${c.name}, ${c.handle})
      ON CONFLICT (wallet_address) DO UPDATE SET
        name = EXCLUDED.name
    `;
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to register creator' });
  }
}
