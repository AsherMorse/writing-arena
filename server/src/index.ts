import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

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

registerRoutes(app);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
