# Sessions, cookies, and state — Cookie Session Model

## Purpose
Manage HTTP state explicitly with secure cookie settings, durable stores, rotation strategy, and clear tenancy boundaries.

## When to use
Use this resource when the current task involves: express-session, cookie-session, cookie-parser, signed cookies, secure/httpOnly/sameSite, session store, CSRF tokens, login/logout, session fixation, rolling sessions, proxy TLS.

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
- [../templates/src/state/session.ts](../templates/src/state/session.ts)
- [../templates/src/state/cookies.ts](../templates/src/state/cookies.ts)
- [../templates/src/state/csrf.ts](../templates/src/state/csrf.ts)
- [../templates/src/auth/login.ts](../templates/src/auth/login.ts)
- [../examples/redis-session-store.md](../examples/redis-session-store.md)
- [../examples/csrf-form.md](../examples/csrf-form.md)
- [../examples/secure-cookie-behind-proxy.md](../examples/secure-cookie-behind-proxy.md)
- [../checklists/session-security-review.md](../checklists/session-security-review.md)
- [../checklists/state-review.md](../checklists/state-review.md)
- [../scripts/cookie-attribute-check.mjs](../scripts/cookie-attribute-check.mjs)
