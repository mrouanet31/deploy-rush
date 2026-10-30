import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Express server listening on :${env.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server');
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
