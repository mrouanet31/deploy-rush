import type { RequestHandler } from 'express';

/**
 * Template for Realtime, streaming, and files.
 * Adapt this to the target repository conventions.
 */
export const download: RequestHandler = async (_req, res, next) => {
  try {
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};
