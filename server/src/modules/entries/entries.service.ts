import { desc, eq } from "drizzle-orm";
import { db, entries, user } from "../../db/index.js";

export const entriesService = {
  async getAll() {
    return db
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
  },

  async create(content: string, userId: string) {
    const [newEntry] = await db
      .insert(entries)
      .values({ content, userId })
      .returning();
    return newEntry;
  },
};

