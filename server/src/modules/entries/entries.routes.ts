import { Router } from "express";
import { entriesController } from "./entries.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.get("/", entriesController.list);
router.post("/", requireAuth, entriesController.create);

export default router;

