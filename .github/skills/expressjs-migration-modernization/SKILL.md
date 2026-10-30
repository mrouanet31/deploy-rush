---
name: expressjs-migration-modernization
description: Use when migrating Express apps from Express 3/4 to 5, modernizing CommonJS to ESM or TypeScript, replacing removed middleware, updating route patterns, or applying Express v5 codemods.
---

# Migration and modernization

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when migrating Express apps from Express 3/4 to 5, modernizing CommonJS to ESM or TypeScript, replacing removed middleware, updating route patterns, or applying Express v5 codemods.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Modernize incrementally while preserving behavior through tests, route snapshots, and contract checks.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/express5-migration.md](references/express5-migration.md)
- [references/route-pattern-migration.md](references/route-pattern-migration.md)
- [references/middleware-migration.md](references/middleware-migration.md)
- [references/cjs-esm-ts.md](references/cjs-esm-ts.md)
- [references/legacy-audit.md](references/legacy-audit.md)
- [templates/migration/route-snapshot.ts](templates/migration/route-snapshot.ts)
- [templates/migration/compat-tests.ts](templates/migration/compat-tests.ts)
- [templates/migration/checklist.md](templates/migration/checklist.md)
- [templates/src/legacy/adapter.ts](templates/src/legacy/adapter.ts)
- [examples/v4-to-v5-plan.md](examples/v4-to-v5-plan.md)
- [examples/route-pattern-before-after.md](examples/route-pattern-before-after.md)
- [examples/cjs-to-esm.md](examples/cjs-to-esm.md)
- [checklists/migration-review.md](checklists/migration-review.md)
- [checklists/legacy-risk-review.md](checklists/legacy-risk-review.md)
- [scripts/scan-express-legacy.mjs](scripts/scan-express-legacy.mjs)
- [scripts/route-snapshot.mjs](scripts/route-snapshot.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
