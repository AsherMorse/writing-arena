import { Response } from "express";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: { page: number; limit: number; total: number };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export const success = <T>(res: Response, data: T, status = 200) => {
  return res.status(status).json({ success: true, data });
};

export const error = (res: Response, code: string, message: string, status = 400) => {
  return res.status(status).json({ success: false, error: { code, message } });
};

export const paginated = <T>(res: Response, data: T[], meta: PaginationMeta) => {
  return res.status(200).json({ success: true, data, meta });
};

