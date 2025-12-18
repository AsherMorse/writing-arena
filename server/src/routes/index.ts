import { Express } from "express";
import v1Routes from "./v1/index.js";

export const registerRoutes = (app: Express) => {
  app.use("/v1", v1Routes);
};
