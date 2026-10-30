---
name: expressjs-error-handling-resilience
description: Use when designing centralized error handling, async failure behavior, Problem Details responses, 404 handling, process-level failure strategy, graceful shutdown, health checks, or reliability controls.
---

# Error handling and resilience

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when designing centralized error handling, async failure behavior, Problem Details responses, 404 handling, process-level failure strategy, graceful shutdown, health checks, or reliability controls.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Make failures explicit, typed, observable, and safe for clients while preserving graceful shutdown semantics.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/express5-error-semantics.md](references/express5-error-semantics.md)
- [references/error-taxonomy.md](references/error-taxonomy.md)
- [references/problem-details.md](references/problem-details.md)
- [references/graceful-shutdown.md](references/graceful-shutdown.md)
- [references/health-checks.md](references/health-checks.md)
- [templates/src/errors/app-error.ts](templates/src/errors/app-error.ts)
- [templates/src/errors/error-handler.ts](templates/src/errors/error-handler.ts)
- [templates/src/errors/not-found.ts](templates/src/errors/not-found.ts)
- [templates/src/server/graceful-shutdown.ts](templates/src/server/graceful-shutdown.ts)
- [templates/src/routes/health.ts](templates/src/routes/health.ts)
- [examples/async-errors.md](examples/async-errors.md)
- [examples/problem-details-responses.md](examples/problem-details-responses.md)
- [examples/shutdown-flow.md](examples/shutdown-flow.md)
- [checklists/error-handling-review.md](checklists/error-handling-review.md)
- [checklists/resilience-review.md](checklists/resilience-review.md)
- [scripts/simulate-sigterm.mjs](scripts/simulate-sigterm.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
