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

  // Initialize Database (Simple migration)
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
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_address TEXT NOT NULL,
          creator_id TEXT NOT NULL,
          tier_name TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
