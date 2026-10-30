---
name: expressjs-new-app
description: Use when creating, bootstrapping, or reorganizing a new Express.js 5 application with TypeScript or modern ESM, including project structure, package scripts, env/config, health endpoints, and baseline middleware.
---

# Express new app

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when creating, bootstrapping, or reorganizing a new Express.js 5 application with TypeScript or modern ESM, including project structure, package scripts, env/config, health endpoints, and baseline middleware.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Create a clean Express.js service/app foundation that is testable, observable, secure-by-default, and ready for production hardening.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/project-layout.md](references/project-layout.md)
- [references/bootstrap-decisions.md](references/bootstrap-decisions.md)
- [references/configuration-env.md](references/configuration-env.md)
- [references/health-baseline.md](references/health-baseline.md)
- [templates/package.json](templates/package.json)
- [templates/tsconfig.json](templates/tsconfig.json)
- [templates/src/app.ts](templates/src/app.ts)
- [templates/src/server.ts](templates/src/server.ts)
- [templates/src/config/env.ts](templates/src/config/env.ts)
- [templates/src/routes/health.ts](templates/src/routes/health.ts)
- [templates/src/middleware/request-id.ts](templates/src/middleware/request-id.ts)
- [examples/minimal-esm-app.md](examples/minimal-esm-app.md)
- [examples/typescript-service.md](examples/typescript-service.md)
- [checklists/new-app-checklist.md](checklists/new-app-checklist.md)
- [checklists/production-readiness-start.md](checklists/production-readiness-start.md)
- [scripts/scaffold-express-ts.mjs](scripts/scaffold-express-ts.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
