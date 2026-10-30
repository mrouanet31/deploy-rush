import type { RequestHandler } from 'express';

/**
 * Template for Testing and quality.
 * Adapt this to the target repository conventions.
 */
export const app_test: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
