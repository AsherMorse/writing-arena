import { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { error } from "../utils/response.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    return error(res, "UNAUTHORIZED", "Authentication required", 401);
  }
  req.user = session.user;
  req.session = session.session;
  next();
};

