import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { ensureMissionRow, ensureMuseRow, ensureSchema, getSql, seedCreators } from "./lib/db";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/creators", async (req, res) => {
    try {
      const sql = getSql();
      if (!sql) {
        return res.json({ creators: [] });
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
      res.json({ creators });
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ error: "Failed to fetch creators" });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    try {
      res.status(501).json({ error: "Upload is not wired for Vercel in this migration" });
    } catch (error) {
      console.error("Error uploading:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/muse/:address", async (req, res) => {
    try {
      const sql = getSql();
      if (!sql) return res.json({ muse: null, stats: null });

      await ensureSchema();
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
      const sql = getSql();
      if (!sql) throw new Error("DB not connected");
      await ensureSchema();
      await ensureMuseRow(sql, address, name || "My Muse");
      await ensureMissionRow(sql, address);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to init muse" });
    }
  });

  app.post("/api/muse/update-name", async (req, res) => {
    const { address, name } = req.body;
    try {
      const sql = getSql();
      if (!sql) throw new Error("DB not connected");
      await ensureSchema();
      await ensureMuseRow(sql, address, name || "My Muse");
      await sql`
        UPDATE muses
        SET name = ${name}
        WHERE user_address = ${address}
      `;
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating name:", error);
      res.status(500).json({ error: "Failed to update name" });
    }
  });

  app.post("/api/record-game", async (req, res) => {
    const { address, gameId } = req.body;
    try {
      const sql = getSql();
      if (!sql) throw new Error("DB not connected");
      await ensureSchema();
      await ensureMuseRow(sql, address);
      await ensureMissionRow(sql, address);

      const [stats] = await sql`SELECT games_played, last_check_date FROM user_missions WHERE user_address = ${address}`;

      let gamesPlayed = stats?.games_played || { pong: false, tetris: false, reversi: false, backgammon: false };
      if (typeof gamesPlayed === "string") {
        gamesPlayed = JSON.parse(gamesPlayed);
      }

      const today = new Date().toISOString().split('T')[0];
      const lastDate = stats?.last_check_date ? new Date(stats.last_check_date).toISOString().split('T')[0] : today;

      if (today !== lastDate) {
        gamesPlayed = { pong: false, tetris: false, reversi: false, backgammon: false };
      }

      if (!gamesPlayed[gameId]) {
        gamesPlayed[gameId] = true;

        let reward = 0;
        const allPlayed = Object.values(gamesPlayed).every(v => v === true);
        if (allPlayed) reward = 200;

        await sql`
          UPDATE user_missions SET
            games_played = ${JSON.stringify(gamesPlayed)}::jsonb,
            ymp = COALESCE(ymp, 0) + ${reward},
            last_check_date = CURRENT_DATE
          WHERE user_address = ${address}
        `;

        await sql`UPDATE muses SET exp = COALESCE(exp, 0) + 10 WHERE user_address = ${address}`;

        return res.json({ success: true, reward, allPlayed });
      }

      res.json({ success: true, reward: 0, allPlayed: false });
    } catch (error) {
      console.error("Error recording game:", error);
      res.status(500).json({ error: "Failed to record game" });
    }
  });

  app.post("/api/record-sponsorship", async (req, res) => {
    const { address, amount } = req.body;
    try {
      const sql = getSql();
      if (!sql) throw new Error("DB not connected");
      await ensureSchema();
      await ensureMuseRow(sql, address);
      await ensureMissionRow(sql, address);

      await sql`
        INSERT INTO user_missions (user_address, ymp, daily_sponsorships, daily_amount, weekly_amount, total_amount)
        VALUES (${address}, 100, 1, ${amount}, ${amount}, ${amount})
        ON CONFLICT (user_address) DO UPDATE SET
          ymp = COALESCE(user_missions.ymp, 0) + 100,
          daily_sponsorships = COALESCE(user_missions.daily_sponsorships, 0) + 1,
          daily_amount = COALESCE(user_missions.daily_amount, 0) + ${amount},
          weekly_amount = COALESCE(user_missions.weekly_amount, 0) + ${amount},
          total_amount = COALESCE(user_missions.total_amount, 0) + ${amount}
      `;

      await sql`
        UPDATE muses SET
          exp = COALESCE(exp, 0) + 50,
          charm = COALESCE(charm, 10) + 1,
          talent = COALESCE(talent, 10) + 1,
          fanbase = COALESCE(fanbase, 10) + 1
        WHERE user_address = ${address}
      `;

      const [muse] = await sql`SELECT level, exp FROM muses WHERE user_address = ${address}`;
      if (muse && muse.exp >= 1000) {
        await sql`UPDATE muses SET level = COALESCE(level, 1) + 1, exp = COALESCE(exp, 0) - 1000 WHERE user_address = ${address}`;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error recording sponsorship:", error);
      res.status(500).json({ error: "Failed to record sponsorship" });
    }
  });

  app.post("/api/init-db", async (req, res) => {
    try {
      const sql = getSql();
      if (!sql) throw new Error("DATABASE_URL not set");
      await ensureSchema();
      await seedCreators(sql);
      res.json({ message: "Database initialized" });
    } catch (error) {
      console.error("Error initializing DB:", error);
      res.status(500).json({ error: "DB init failed" });
    }
  });

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
