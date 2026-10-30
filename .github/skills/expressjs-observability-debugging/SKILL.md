---
name: expressjs-observability-debugging
description: Use when adding logs, request IDs, metrics, traces, debug namespaces, health diagnostics, dependency status, error visibility, or troubleshooting an Express.js application.
---

# Observability and debugging

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when adding logs, request IDs, metrics, traces, debug namespaces, health diagnostics, dependency status, error visibility, or troubleshooting an Express.js application.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Make the Express request lifecycle observable without leaking sensitive data or blocking requests.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/debugging.md](references/debugging.md)
- [references/logging.md](references/logging.md)
- [references/metrics-tracing.md](references/metrics-tracing.md)
- [references/health-diagnostics.md](references/health-diagnostics.md)
- [references/redaction.md](references/redaction.md)
- [templates/src/observability/logger.ts](templates/src/observability/logger.ts)
- [templates/src/observability/request-logger.ts](templates/src/observability/request-logger.ts)
- [templates/src/observability/metrics.ts](templates/src/observability/metrics.ts)
- [templates/src/observability/tracing.ts](templates/src/observability/tracing.ts)
- [templates/src/routes/diagnostics.ts](templates/src/routes/diagnostics.ts)
- [examples/debug-namespaces.md](examples/debug-namespaces.md)
- [examples/pino-request-log.md](examples/pino-request-log.md)
- [examples/otel-http.md](examples/otel-http.md)
- [checklists/observability-review.md](checklists/observability-review.md)
- [checklists/debug-triage.md](checklists/debug-triage.md)
- [scripts/collect-diagnostics.mjs](scripts/collect-diagnostics.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
