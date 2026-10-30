import type { RequestHandler } from 'express';

/**
 * Template for Request and response API.
 * Adapt this to the target repository conventions.
 */
export const respond: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
