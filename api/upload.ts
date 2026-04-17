export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(501).json({
    error: 'Upload endpoint is not migrated in this Neon/Vercel fix. Keep using the local Express server for file uploads, or wire this route to Vercel Blob separately.'
  });
}
