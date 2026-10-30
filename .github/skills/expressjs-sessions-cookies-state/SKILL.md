---
name: expressjs-sessions-cookies-state
description: Use when implementing sessions, cookies, flash-like state, CSRF state, signed cookies, secure cookie attributes, stores, login lifecycle, logout, or stateful auth in Express.js.
---

# Sessions, cookies, and state

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when implementing sessions, cookies, flash-like state, CSRF state, signed cookies, secure cookie attributes, stores, login lifecycle, logout, or stateful auth in Express.js.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Manage HTTP state explicitly with secure cookie settings, durable stores, rotation strategy, and clear tenancy boundaries.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/cookie-session-model.md](references/cookie-session-model.md)
- [references/session-stores.md](references/session-stores.md)
- [references/csrf-state.md](references/csrf-state.md)
- [references/cookie-security.md](references/cookie-security.md)
- [references/logout-rotation.md](references/logout-rotation.md)
- [templates/src/state/session.ts](templates/src/state/session.ts)
- [templates/src/state/cookies.ts](templates/src/state/cookies.ts)
- [templates/src/state/csrf.ts](templates/src/state/csrf.ts)
- [templates/src/auth/login.ts](templates/src/auth/login.ts)
- [templates/src/auth/logout.ts](templates/src/auth/logout.ts)
- [examples/redis-session-store.md](examples/redis-session-store.md)
- [examples/csrf-form.md](examples/csrf-form.md)
- [examples/secure-cookie-behind-proxy.md](examples/secure-cookie-behind-proxy.md)
- [checklists/session-security-review.md](checklists/session-security-review.md)
- [checklists/state-review.md](checklists/state-review.md)
- [scripts/cookie-attribute-check.mjs](scripts/cookie-attribute-check.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
