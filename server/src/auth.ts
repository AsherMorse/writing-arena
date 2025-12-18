import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { v7 as uuidv7 } from "uuid";
import { db } from "./db/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  basePath: "/auth",
  trustedOrigins: [process.env.CORS_ORIGIN!],
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
});

