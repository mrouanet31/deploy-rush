import type { RequestHandler } from 'express';

/**
 * Template for API contracts and OpenAPI.
 * Adapt this to the target repository conventions.
 */
export const validate_request: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
