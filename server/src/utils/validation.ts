import { RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import { error } from "./response.js";

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = formatZodError(result.error);
      return error(res, "VALIDATION_ERROR", message, 400);
    }
    req.body = result.data;
    next();
  };
};

function formatZodError(err: ZodError): string {
  return err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
}
