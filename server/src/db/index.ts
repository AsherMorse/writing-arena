import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const db = drizzle(process.env.DATABASE_URL, { schema });

export { db };
export * from "./schema.js";

