import { Express } from "express";
import entriesRoutes from "../modules/entries/entries.routes.js";

export const registerRoutes = (app: Express) => {
  app.use("/entries", entriesRoutes);
};

