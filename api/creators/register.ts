import { sql } from '../db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const c = req.body ?? {};

    if (!c.wallet_address || !c.name || !c.handle) {
      res.status(400).json({ error: 'Missing wallet_address, name, or handle' });
      return;
    }

    await sql`
      INSERT INTO creators (
        id, wallet_address, name, handle, description, avatar, cover, subscribers, tiers
      )
      VALUES (
        ${c.id ?? c.wallet_address},
        ${c.wallet_address},
        ${c.name},
        ${c.handle},
        ${c.description ?? ''},
        ${c.avatar ?? ''},
        ${c.cover ?? ''},
        ${Number(c.subscribers ?? 0)},
        ${JSON.stringify(c.tiers ?? [])}::jsonb
      )
      ON CONFLICT (wallet_address) DO UPDATE SET
        name = EXCLUDED.name,
        handle = EXCLUDED.handle,
        description = EXCLUDED.description,
        avatar = EXCLUDED.avatar,
        cover = EXCLUDED.cover,
        subscribers = EXCLUDED.subscribers,
        tiers = EXCLUDED.tiers,
        updated_at = CURRENT_TIMESTAMP
    `;

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Failed to register creator:', error);
    res.status(500).json({ error: 'Failed to register creator' });
  }
}
