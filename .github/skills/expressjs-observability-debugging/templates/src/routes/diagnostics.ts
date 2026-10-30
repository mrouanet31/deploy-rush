import type { RequestHandler } from 'express';

/**
 * Template for Observability and debugging.
 * Adapt this to the target repository conventions.
 */
export const diagnostics: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
