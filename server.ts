import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Neon DB Client
  const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

  // Multer for file uploads
  const upload = multer({ storage: multer.memoryBuffer() });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fetch Creators
  app.get("/api/creators", async (req, res) => {
    try {
      if (!sql) {
        return res.json({ creators: [] }); // Fallback or mock
      }
      const creators = await sql`SELECT * FROM creators ORDER BY subscribers DESC`;
      res.json({ creators });
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ error: "Failed to fetch creators" });
    }
  });

  // Upload to Vercel Blob
  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: "Vercel Blob token not configured" });
      }

      const blob = await put(req.file.originalname, req.file.buffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      res.json(blob);
    } catch (error) {
      console.error("Error uploading to Vercel Blob:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Muse API
  app.get("/api/muse/:address", async (req, res) => {
    try {
      if (!sql) return res.json({ muse: null });
      const [muse] = await sql`SELECT * FROM muses WHERE user_address = ${req.params.address}`;
      const [stats] = await sql`SELECT * FROM user_missions WHERE user_address = ${req.params.address}`;
      res.json({ muse: muse || null, stats: stats || null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch muse" });
    }
  });

  app.post("/api/muse/init", async (req, res) => {
    const { address, name } = req.body;
    try {
      if (!sql) throw new Error("DB not connected");
      await sql`
        INSERT INTO muses (user_address, name) 
        VALUES (${address}, ${name})
        ON CONFLICT (user_address) DO NOTHING
      `;
      await sql`
        INSERT INTO user_missions (user_address) 
        VALUES (${address})
        ON CONFLICT (user_address) DO NOTHING
      `;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to init muse" });
    }
  });

  app.post("/api/record-sponsorship", async (req, res) => {
    const { address, amount } = req.body;
    try {
      if (!sql) throw new Error("DB not connected");
      
      // Update user missions stats
      await sql`
        INSERT INTO user_missions (user_address, ymp, daily_sponsorships, daily_amount, weekly_amount, total_amount)
        VALUES (${address}, 100, 1, ${amount}, ${amount}, ${amount})
        ON CONFLICT (user_address) DO UPDATE SET
          ymp = user_missions.ymp + 100,
          daily_sponsorships = user_missions.daily_sponsorships + 1,
          daily_amount = user_missions.daily_amount + ${amount},
          weekly_amount = user_missions.weekly_amount + ${amount},
          total_amount = user_missions.total_amount + ${amount}
      `;

      // Update Muse EXP and stats
      await sql`
        UPDATE muses SET
          exp = exp + 50,
          charm = charm + 1,
          talent = talent + 1,
          fanbase = fanbase + 1
        WHERE user_address = ${address}
      `;

      // Check for level up
      const [muse] = await sql`SELECT level, exp FROM muses WHERE user_address = ${address}`;
      if (muse && muse.exp >= 1000) {
        await sql`UPDATE muses SET level = level + 1, exp = exp - 1000 WHERE user_address = ${address}`;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording sponsorship:", error);
      res.status(500).json({ error: "Failed to record sponsorship" });
    }
  });
  app.post("/api/init-db", async (req, res) => {
    try {
      if (!sql) throw new Error("DATABASE_URL not set");
      
      await sql`
        CREATE TABLE IF NOT EXISTS creators (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          handle TEXT NOT NULL,
          description TEXT,
          avatar TEXT,
          cover TEXT,
          subscribers INTEGER DEFAULT 0,
          tiers JSONB
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS muses (
          user_address TEXT PRIMARY KEY,
          name TEXT DEFAULT 'My Muse',
          level INTEGER DEFAULT 1,
          exp INTEGER DEFAULT 0,
          charm INTEGER DEFAULT 10,
          talent INTEGER DEFAULT 10,
          fanbase INTEGER DEFAULT 10,
          skin_id TEXT DEFAULT 'casual_1',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS user_missions (
          user_address TEXT PRIMARY KEY,
          ymp INTEGER DEFAULT 0,
          daily_sponsorships INTEGER DEFAULT 0,
          daily_amount NUMERIC DEFAULT 0,
          weekly_amount NUMERIC DEFAULT 0,
          total_amount NUMERIC DEFAULT 0,
          last_check_date DATE DEFAULT CURRENT_DATE
        )
      `;

      res.json({ message: "Database initialized" });
    } catch (error) {
      console.error("Error initializing DB:", error);
      res.status(500).json({ error: "DB init failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
