import { Router } from "express";
import { entriesController } from "./entries.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validation.js";
import { createEntrySchema } from "./entries.schema.js";

const router = Router();

router.get("/", entriesController.list);
router.post("/", requireAuth, validate(createEntrySchema), entriesController.create);

export default router;
