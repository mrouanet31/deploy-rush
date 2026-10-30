---
name: expressjs-performance-production
description: Use when optimizing Express.js performance or production reliability: compression, sync call removal, NODE_ENV, reverse proxies, clustering, caching, body limits, timeouts, load testing, and event-loop health.
---

# Performance and production reliability

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when optimizing Express.js performance or production reliability: compression, sync call removal, NODE_ENV, reverse proxies, clustering, caching, body limits, timeouts, load testing, and event-loop health.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Improve throughput and reliability using measurement, event-loop-friendly code, and production-aware runtime configuration.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/production-performance.md](references/production-performance.md)
- [references/event-loop-safety.md](references/event-loop-safety.md)
- [references/compression-caching.md](references/compression-caching.md)
- [references/timeouts-limits.md](references/timeouts-limits.md)
- [references/reverse-proxy.md](references/reverse-proxy.md)
- [templates/src/server/timeouts.ts](templates/src/server/timeouts.ts)
- [templates/src/performance/compression.ts](templates/src/performance/compression.ts)
- [templates/src/performance/cache-control.ts](templates/src/performance/cache-control.ts)
- [templates/ecosystem.config.cjs](templates/ecosystem.config.cjs)
- [templates/nginx/express.conf](templates/nginx/express.conf)
- [examples/production-env.md](examples/production-env.md)
- [examples/proxy-headers.md](examples/proxy-headers.md)
- [examples/load-test.md](examples/load-test.md)
- [checklists/performance-review.md](checklists/performance-review.md)
- [checklists/production-reliability-review.md](checklists/production-reliability-review.md)
- [scripts/event-loop-lag.mjs](scripts/event-loop-lag.mjs)
- [scripts/load-smoke.mjs](scripts/load-smoke.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
