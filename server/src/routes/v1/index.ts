import { Router } from "express";
import entriesRoutes from "../../modules/entries/entries.routes.js";

const router = Router();

router.use("/entries", entriesRoutes);

export default router;
