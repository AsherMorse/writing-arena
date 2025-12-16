import { RequestHandler } from "express";
import { entriesService } from "./entries.service.js";
import { success, error } from "../../utils/response.js";

export const entriesController = {
  list: (async (_req, res) => {
    const allEntries = await entriesService.getAll();
    return success(res, allEntries);
  }) as RequestHandler,

  create: (async (req, res) => {
    const { content } = req.body;
    if (!content?.trim()) {
      return error(res, "VALIDATION_ERROR", "Content is required", 400);
    }
    const newEntry = await entriesService.create(content.trim(), req.user!.id);
    return success(res, newEntry, 201);
  }) as RequestHandler,
};

