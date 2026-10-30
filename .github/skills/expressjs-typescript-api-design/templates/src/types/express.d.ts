import type { RequestHandler } from 'express';

/**
 * Template for TypeScript API design.
 * Adapt this to the target repository conventions.
 */
export const express_d: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
