import type { RequestHandler } from 'express';

/**
 * Template for Middleware pipeline.
 * Adapt this to the target repository conventions.
 */
export const validate: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
