import { ErrorRequestHandler } from "express";
import { error } from "../utils/response.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  return error(res, "INTERNAL_ERROR", "An unexpected error occurred", 500);
};

