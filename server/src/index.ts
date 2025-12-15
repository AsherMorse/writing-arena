import "dotenv/config";
import express from "express";
import cors from "cors";
import { desc, eq } from "drizzle-orm";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { db, entries, user } from "./db/index.js";
import { auth } from "./auth.js";

const app = express();
const port = process.env.PORT!;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN!,
    credentials: true,
  })
);

app.all("/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/entries", async (_req, res) => {
  try {
    const allEntries = await db
      .select({
        id: entries.id,
        content: entries.content,
        createdAt: entries.createdAt,
        userId: entries.userId,
        userName: user.name,
      })
      .from(entries)
      .leftJoin(user, eq(entries.userId, user.id))
      .orderBy(desc(entries.createdAt));
    res.json(allEntries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    const [newEntry] = await db.insert(entries).values({ 
      content: content.trim(),
      userId: session.user.id,
    }).returning();
    res.status(201).json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

