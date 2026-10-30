import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/ready', async (_req, res) => {
  // Add dependency checks here: DB ping, cache ping, queue status.
  res.status(200).json({ status: 'ready' });
});
