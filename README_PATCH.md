# YabamateE patch notes

## What changed
- Creator list is loaded from `/api/creators`
- `CreatorPanel` is wired into `App.tsx`
- MetaMask wallet connection opens the creator panel
- Neon schema includes `creators.wallet_address`
- `/api/init-db` creates the required tables
- `/api/creators/register` saves creator profiles

## Neon recommendation
Use the pooled connection string in `DATABASE_URL` on Vercel. Keep a direct URL separately for manual migrations if needed.
