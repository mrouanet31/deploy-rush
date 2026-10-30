import type { RequestHandler } from 'express';

/**
 * Template for Migration and modernization.
 * Adapt this to the target repository conventions.
 */
export const adapter: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
