---
name: expressjs-routing-architecture
description: Use when designing Express.js route structure, routers, controller-service boundaries, route params, path matching, API versioning, modular applications, or clean architecture for REST-like services.
---

# Routing and architecture

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when designing Express.js route structure, routers, controller-service boundaries, route params, path matching, API versioning, modular applications, or clean architecture for REST-like services.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Structure routes and modules so that HTTP routing stays thin, explicit, versionable, and testable.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/routing-model.md](references/routing-model.md)
- [references/router-composition.md](references/router-composition.md)
- [references/controller-service-boundaries.md](references/controller-service-boundaries.md)
- [references/versioning.md](references/versioning.md)
- [templates/src/routes/index.ts](templates/src/routes/index.ts)
- [templates/src/modules/users/users.routes.ts](templates/src/modules/users/users.routes.ts)
- [templates/src/modules/users/users.controller.ts](templates/src/modules/users/users.controller.ts)
- [templates/src/modules/users/users.service.ts](templates/src/modules/users/users.service.ts)
- [templates/src/modules/users/users.types.ts](templates/src/modules/users/users.types.ts)
- [examples/router-mounting.md](examples/router-mounting.md)
- [examples/route-ordering-pitfalls.md](examples/route-ordering-pitfalls.md)
- [checklists/routing-review.md](checklists/routing-review.md)
- [checklists/architecture-review.md](checklists/architecture-review.md)
- [scripts/print-route-map.mjs](scripts/print-route-map.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
