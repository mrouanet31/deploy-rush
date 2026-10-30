# Middleware pipeline — Middleware Ordering

## Purpose
Build middleware pipelines that are ordered, minimal, composable, async-safe, and easy to reason about.

## When to use
Use this resource when the current task involves: app.use, router.use, middleware order, built-in middleware, third-party middleware, next(), next("route"), error middleware shape, async middleware.

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
- [../templates/src/middleware/authenticate.ts](../templates/src/middleware/authenticate.ts)
- [../templates/src/middleware/validate.ts](../templates/src/middleware/validate.ts)
- [../templates/src/middleware/not-found.ts](../templates/src/middleware/not-found.ts)
- [../templates/src/middleware/error-handler.ts](../templates/src/middleware/error-handler.ts)
- [../examples/middleware-stack.md](../examples/middleware-stack.md)
- [../examples/common-order.md](../examples/common-order.md)
- [../checklists/middleware-review.md](../checklists/middleware-review.md)
- [../checklists/async-safety.md](../checklists/async-safety.md)
- [../scripts/middleware-smoke-test.mjs](../scripts/middleware-smoke-test.mjs)
