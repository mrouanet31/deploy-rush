# Data and persistence — Caching

## Purpose
Keep persistence concerns outside route handlers, manage lifecycle and pooling explicitly, and make data access testable.

## When to use
Use this resource when the current task involves: database drivers, connection pooling, repositories, transactions, migrations, ORM/query builders, Redis cache, request context, cleanup on shutdown, integration tests.

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
- [../templates/src/db/pool.ts](../templates/src/db/pool.ts)
- [../templates/src/db/transaction.ts](../templates/src/db/transaction.ts)
- [../templates/src/repositories/user-repository.ts](../templates/src/repositories/user-repository.ts)
- [../templates/src/modules/users/users.repository.ts](../templates/src/modules/users/users.repository.ts)
- [../examples/postgres-route.md](../examples/postgres-route.md)
- [../examples/transactional-service.md](../examples/transactional-service.md)
- [../examples/redis-cache.md](../examples/redis-cache.md)
- [../checklists/data-access-review.md](../checklists/data-access-review.md)
- [../checklists/database-lifecycle-review.md](../checklists/database-lifecycle-review.md)
- [../scripts/db-smoke-test.mjs](../scripts/db-smoke-test.mjs)
