# Migration and modernization — Cjs Esm Ts

## Purpose
Modernize incrementally while preserving behavior through tests, route snapshots, and contract checks.

## When to use
Use this resource when the current task involves: Express 4 to 5, codemods, promise error handling, path-to-regexp changes, removed APIs, middleware extraction, CJS to ESM, TypeScript adoption, security updates, route snapshots.

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
- [../templates/migration/route-snapshot.ts](../templates/migration/route-snapshot.ts)
- [../templates/migration/compat-tests.ts](../templates/migration/compat-tests.ts)
- [../templates/migration/checklist.md](../templates/migration/checklist.md)
- [../templates/src/legacy/adapter.ts](../templates/src/legacy/adapter.ts)
- [../examples/v4-to-v5-plan.md](../examples/v4-to-v5-plan.md)
- [../examples/route-pattern-before-after.md](../examples/route-pattern-before-after.md)
- [../examples/cjs-to-esm.md](../examples/cjs-to-esm.md)
- [../checklists/migration-review.md](../checklists/migration-review.md)
- [../checklists/legacy-risk-review.md](../checklists/legacy-risk-review.md)
- [../scripts/scan-express-legacy.mjs](../scripts/scan-express-legacy.mjs)
- [../scripts/route-snapshot.mjs](../scripts/route-snapshot.mjs)
