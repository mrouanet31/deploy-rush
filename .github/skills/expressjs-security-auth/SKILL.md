---
name: expressjs-security-auth
description: Use when securing an Express.js app: Helmet, CORS, cookies/sessions, CSRF, rate limiting, authn/authz, input validation, proxy trust, TLS assumptions, file upload safety, or security headers.
---

# Security and auth

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when securing an Express.js app: Helmet, CORS, cookies/sessions, CSRF, rate limiting, authn/authz, input validation, proxy trust, TLS assumptions, file upload safety, or security headers.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Harden the app surface without hiding trust boundaries or relying on Express defaults for security.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/security-baseline.md](references/security-baseline.md)
- [references/auth-patterns.md](references/auth-patterns.md)
- [references/sessions-cookies-csrf.md](references/sessions-cookies-csrf.md)
- [references/cors-trust-proxy.md](references/cors-trust-proxy.md)
- [references/input-validation.md](references/input-validation.md)
- [references/uploads.md](references/uploads.md)
- [templates/src/security/helmet.ts](templates/src/security/helmet.ts)
- [templates/src/security/cors.ts](templates/src/security/cors.ts)
- [templates/src/security/rate-limit.ts](templates/src/security/rate-limit.ts)
- [templates/src/security/session.ts](templates/src/security/session.ts)
- [templates/src/security/authenticate.ts](templates/src/security/authenticate.ts)
- [templates/src/security/authorize.ts](templates/src/security/authorize.ts)
- [examples/secure-cookie-session.md](examples/secure-cookie-session.md)
- [examples/safe-redirect.md](examples/safe-redirect.md)
- [examples/rbac-route.md](examples/rbac-route.md)
- [checklists/security-review.md](checklists/security-review.md)
- [checklists/auth-review.md](checklists/auth-review.md)
- [checklists/upload-review.md](checklists/upload-review.md)
- [scripts/security-header-check.mjs](scripts/security-header-check.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
