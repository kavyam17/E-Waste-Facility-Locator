import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import db from "./db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      db.prepare('INSERT INTO users (id, name, email, password, role, credits) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name, email, password, 'user', 0);
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  // Facilities
  app.get("/api/facilities", (req, res) => {
    const facilities = db.prepare('SELECT * FROM facilities').all() as any[];
    res.json(facilities.map(f => ({ ...f, acceptedItems: JSON.parse(f.acceptedItems) })));
  });

  // Rewards
  app.get("/api/rewards", (req, res) => {
    const rewards = db.prepare('SELECT * FROM rewards').all();
    res.json(rewards);
  });

  app.post("/api/rewards/redeem", (req, res) => {
    const { userId, rewardId } = req.body;
    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(rewardId) as any;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!reward || !user) return res.status(404).json({ error: "Not found" });
    if (user.credits < reward.cost) return res.status(400).json({ error: "Insufficient credits" });

    const id = Math.random().toString(36).substr(2, 9);
    const date = new Date().toISOString();

    const transaction = db.transaction(() => {
      db.prepare('INSERT INTO user_rewards (id, userId, rewardId, date) VALUES (?, ?, ?, ?)')
        .run(id, userId, rewardId, date);
      db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?')
        .run(reward.cost, userId);
    });

    transaction();
    res.json({ success: true });
  });

  app.post("/api/rewards", (req, res) => {
    const { name, cost, type, description } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO rewards (id, name, cost, type, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, cost, type, description);
    res.json({ id, name, cost, type, description });
  });

  app.delete("/api/rewards/:id", (req, res) => {
    db.prepare('DELETE FROM rewards WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // History
  app.get("/api/history/:userId", (req, res) => {
    const history = db.prepare('SELECT * FROM disposal_history WHERE userId = ? ORDER BY date DESC').all(req.params.userId);
    res.json(history);
  });

  app.post("/api/history", (req, res) => {
    const { userId, facilityId, itemName, category, weight, creditsEarned, date, status, proofUrl } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO disposal_history (id, userId, facilityId, itemName, category, weight, creditsEarned, date, status, proofUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, facilityId, itemName, category, weight, creditsEarned, date, status, proofUrl);
    
    // If status is approved (e.g. auto-approved for testing), update user credits
    if (status === 'approved') {
      db.prepare('UPDATE users SET credits = credits + ?, totalDisposed = totalDisposed + ? WHERE id = ?')
        .run(creditsEarned, weight, userId);
    }
    
    res.json({ id, success: true });
  });

  // Admin Endpoints
  app.get("/api/admin/disposals", (req, res) => {
    const disposals = db.prepare(`
      SELECT d.*, u.name as userName, f.name as facilityName 
      FROM disposal_history d
      JOIN users u ON d.userId = u.id
      JOIN facilities f ON d.facilityId = f.id
      ORDER BY d.date DESC
    `).all();
    res.json(disposals);
  });

  app.put("/api/admin/disposals/:id", (req, res) => {
    const { status, creditsEarned } = req.body;
    const disposal = db.prepare('SELECT * FROM disposal_history WHERE id = ?').get(req.params.id) as any;
    
    if (!disposal) return res.status(404).json({ error: "Disposal not found" });
    if (disposal.status !== 'pending') return res.status(400).json({ error: "Already processed" });

    db.prepare('UPDATE disposal_history SET status = ?, creditsEarned = ? WHERE id = ?')
      .run(status, creditsEarned, req.params.id);

    if (status === 'approved') {
      db.prepare('UPDATE users SET credits = credits + ?, totalDisposed = totalDisposed + ? WHERE id = ?')
        .run(creditsEarned, disposal.weight, disposal.userId);
    }

    res.json({ success: true });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users WHERE role = 'user'").all();
    res.json(users);
  });

  // Leaderboard
  app.get("/api/leaderboard", (req, res) => {
    const leaderboard = db.prepare('SELECT id, name, totalDisposed, credits, rank FROM users ORDER BY totalDisposed DESC LIMIT 10').all();
    res.json(leaderboard);
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all() as any[];
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: JSON.parse(s.value) }), {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const transaction = db.transaction(() => {
      Object.entries(settings).forEach(([key, value]) => {
        upsert.run(key, JSON.stringify(value));
      });
    });
    transaction();
    res.json({ success: true });
  });

  // User Profile
  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });

    const rewards = db.prepare(`
      SELECT r.*, ur.date as redeemedDate
      FROM rewards r
      JOIN user_rewards ur ON r.id = ur.rewardId
      WHERE ur.userId = ?
    `).all(req.params.id);

    res.json({ ...user, rewards });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
