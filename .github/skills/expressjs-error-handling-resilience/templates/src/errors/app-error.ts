import type { RequestHandler } from 'express';

/**
 * Template for Error handling and resilience.
 * Adapt this to the target repository conventions.
 */
export const app_error: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
