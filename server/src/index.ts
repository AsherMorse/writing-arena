import "dotenv/config";
import express from "express";
import cors from "cors";
import { desc } from "drizzle-orm";
import { db, entries } from "./db/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/entries", async (_req, res) => {
  try {
    const allEntries = await db.select().from(entries).orderBy(desc(entries.createdAt));
    res.json(allEntries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    const [newEntry] = await db.insert(entries).values({ content: content.trim() }).returning();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

