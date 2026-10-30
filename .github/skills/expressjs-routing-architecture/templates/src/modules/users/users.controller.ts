import type { RequestHandler } from 'express';

/**
 * Template for Routing and architecture.
 * Adapt this to the target repository conventions.
 */
export const users_controller: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
