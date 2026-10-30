# Realtime, streaming, and files — Sse Heartbeat example

This example illustrates a safe coding-assistant pattern for handle long-lived and file-heavy traffic without blocking the event loop or bypassing security controls..

```ts
import express, { type Request, type Response, type NextFunction } from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404 });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500 });
});

export { app };
```

## Review notes
- Import `app` in tests and start the server only in a separate `server.ts`.
- Replace generic errors with project-specific error classes if the API has a public contract.
- Keep response bodies stable once clients rely on them.
