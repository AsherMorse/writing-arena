import { z } from "zod";

export const createEntrySchema = z.object({
  content: z.string().min(1, "Content is required").transform((s) => s.trim()),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
