<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# YabamateE for Vercel + Neon

This version keeps the SPA in Vite and moves every database-backed endpoint into Vercel API routes.

## Required environment variables

- `DATABASE_URL` — Neon connection string
- `GEMINI_API_KEY` — optional, for the existing AI features
- `BLOB_READ_WRITE_TOKEN` — only needed if you use the upload route

## Vercel deployment

1. Push this repo to GitHub
2. Import it in Vercel
3. Set `DATABASE_URL`
4. Deploy
5. Open `/api/init-db` once after the first deploy

## Local development

1. Install dependencies: `npm install`
2. Set `.env.local`
3. Run: `npm run dev`

## API routes

- `GET /api/health`
- `GET /api/creators`
- `POST /api/init-db`
- `GET /api/muse/:address`
- `POST /api/muse/init`
- `POST /api/muse/update-name`
- `POST /api/record-game`
- `POST /api/record-sponsorship`
