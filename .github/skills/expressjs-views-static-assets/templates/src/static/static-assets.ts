import type { RequestHandler } from 'express';

/**
 * Template for Views and static assets.
 * Adapt this to the target repository conventions.
 */
export const static_assets: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
