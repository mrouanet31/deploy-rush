import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({
    type: 'about:blank',
    title: status === 500 ? 'Internal Server Error' : 'Request Error',
    status,
  });
};
