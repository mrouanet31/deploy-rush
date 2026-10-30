# Testing and quality — Test Database

## Purpose
Make Express behavior testable without binding tests to a live port unless the task explicitly needs networking.

## When to use
Use this resource when the current task involves: Supertest, Vitest/Jest, unit vs integration, app export vs server listen, middleware tests, contract tests, fixtures, coverage, CI, test DB, mocking external APIs.

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
- [../templates/tests/app.test.ts](../templates/tests/app.test.ts)
- [../templates/tests/health.test.ts](../templates/tests/health.test.ts)
- [../templates/tests/auth.test.ts](../templates/tests/auth.test.ts)
- [../templates/tests/middleware.test.ts](../templates/tests/middleware.test.ts)
- [../examples/supertest-no-listen.md](../examples/supertest-no-listen.md)
- [../examples/auth-test.md](../examples/auth-test.md)
- [../examples/contract-test.md](../examples/contract-test.md)
- [../checklists/test-plan-review.md](../checklists/test-plan-review.md)
- [../checklists/ci-review.md](../checklists/ci-review.md)
- [../scripts/test-app-smoke.mjs](../scripts/test-app-smoke.mjs)
