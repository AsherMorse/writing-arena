import { RequestHandler } from "express";
import { entriesService } from "./entries.service.js";
import { success } from "../../utils/response.js";
import { CreateEntryInput } from "./entries.schema.js";

export const entriesController = {
  list: (async (_req, res) => {
    const allEntries = await entriesService.getAll();
    return success(res, allEntries);
  }) as RequestHandler,

  create: (async (req, res) => {
    const { content } = req.body as CreateEntryInput;
    const newEntry = await entriesService.create(content, req.user!.id);
    return success(res, newEntry, 201);
  }) as RequestHandler,
};
