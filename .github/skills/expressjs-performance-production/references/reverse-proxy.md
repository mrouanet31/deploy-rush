# Performance and production reliability — Reverse Proxy

## Purpose
Improve throughput and reliability using measurement, event-loop-friendly code, and production-aware runtime configuration.

## When to use
Use this resource when the current task involves: NODE_ENV=production, gzip/compression, avoid sync functions, logging overhead, reverse proxy, load balancer, cluster/PM2, caching, timeouts, body size limits, event loop delay, graceful shutdown.

## Express-specific guidance
- Prefer Express 5.x semantics and Node.js 18+ unless the repository is pinned differently.
- Keep route handlers thin: parse/validate HTTP input, call domain/application code, map the result to an HTTP response.
- Make middleware order explicit. In Express, order is behavior.
- Treat all request input as untrusted: params, query, body, headers, cookies, files, and proxy-derived headers.
- Separate app construction from server startup so tests can import `app` without binding a port.
- Add centralized 404 and error middleware after normal routes.
- For production, include graceful SIGTERM handling, health/readiness endpoints, request logging, security headers, limits, and dependency cleanup.

## Implementation sequence
1. Identify existing module format: ESM, CommonJS, TypeScript, or mixed.
2. Locate the HTTP boundary: app creation, router mounting, middleware order, server startup.
3. Make the smallest safe change first, then add regression coverage.
4. Validate runtime behavior with tests or a reproducible curl/Supertest scenario.
5. Review security and production impact before finalizing.

## Common pitfalls
- Calling `res.send()`, `res.json()`, or `next()` more than once.
- Adding async middleware without understanding Express 5 promise rejection forwarding.
- Putting error middleware before route handlers.
- Trusting `req.ip`, `req.protocol`, or secure cookies behind a proxy without correct `trust proxy` configuration.
- Serving static files or downloads from user-controlled paths.
- Hiding domain logic inside middleware that cannot be tested in isolation.

## Related local files
- [../templates/src/server/timeouts.ts](../templates/src/server/timeouts.ts)
- [../templates/src/performance/compression.ts](../templates/src/performance/compression.ts)
- [../templates/src/performance/cache-control.ts](../templates/src/performance/cache-control.ts)
- [../templates/ecosystem.config.cjs](../templates/ecosystem.config.cjs)
- [../examples/production-env.md](../examples/production-env.md)
- [../examples/proxy-headers.md](../examples/proxy-headers.md)
- [../examples/load-test.md](../examples/load-test.md)
- [../checklists/performance-review.md](../checklists/performance-review.md)
- [../checklists/production-reliability-review.md](../checklists/production-reliability-review.md)
- [../scripts/event-loop-lag.mjs](../scripts/event-loop-lag.mjs)
- [../scripts/load-smoke.mjs](../scripts/load-smoke.mjs)
