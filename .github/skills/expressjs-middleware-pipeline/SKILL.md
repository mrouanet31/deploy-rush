---
name: expressjs-middleware-pipeline
description: Use when writing, ordering, reviewing, or debugging Express middleware including app-level middleware, router-level middleware, built-in middleware, third-party middleware, and error-handling middleware.
---

# Middleware pipeline

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when writing, ordering, reviewing, or debugging Express middleware including app-level middleware, router-level middleware, built-in middleware, third-party middleware, and error-handling middleware.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Build middleware pipelines that are ordered, minimal, composable, async-safe, and easy to reason about.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/middleware-model.md](references/middleware-model.md)
- [references/middleware-ordering.md](references/middleware-ordering.md)
- [references/built-in-and-third-party.md](references/built-in-and-third-party.md)
- [references/error-middleware.md](references/error-middleware.md)
- [templates/src/middleware/authenticate.ts](templates/src/middleware/authenticate.ts)
- [templates/src/middleware/validate.ts](templates/src/middleware/validate.ts)
- [templates/src/middleware/not-found.ts](templates/src/middleware/not-found.ts)
- [templates/src/middleware/error-handler.ts](templates/src/middleware/error-handler.ts)
- [templates/src/middleware/async-boundary.ts](templates/src/middleware/async-boundary.ts)
- [examples/middleware-stack.md](examples/middleware-stack.md)
- [examples/common-order.md](examples/common-order.md)
- [checklists/middleware-review.md](checklists/middleware-review.md)
- [checklists/async-safety.md](checklists/async-safety.md)
- [scripts/middleware-smoke-test.mjs](scripts/middleware-smoke-test.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
