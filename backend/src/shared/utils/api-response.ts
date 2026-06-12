import { Response } from "express";

/**
 * Sends a consistently-shaped success response. Keeping this in one place
 * means every endpoint returns `{ success, data }` rather than each
 * controller inventing its own envelope.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}
