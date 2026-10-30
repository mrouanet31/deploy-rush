import type { RequestHandler } from 'express';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    type: 'about:blank',
    title: 'Not Found',
    status: 404,
    detail: `${req.method} ${req.originalUrl} was not found`,
  });
};
