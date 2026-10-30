---
name: expressjs-data-persistence
description: Use when integrating Express.js with databases, caches, repositories, transactions, migrations, connection pools, request-scoped data access, Redis, PostgreSQL, MongoDB, SQLite, or ORMs.
---

# Data and persistence

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when integrating Express.js with databases, caches, repositories, transactions, migrations, connection pools, request-scoped data access, Redis, PostgreSQL, MongoDB, SQLite, or ORMs.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Keep persistence concerns outside route handlers, manage lifecycle and pooling explicitly, and make data access testable.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/database-integration.md](references/database-integration.md)
- [references/repository-boundary.md](references/repository-boundary.md)
- [references/transactions.md](references/transactions.md)
- [references/pooling-lifecycle.md](references/pooling-lifecycle.md)
- [references/caching.md](references/caching.md)
- [templates/src/db/pool.ts](templates/src/db/pool.ts)
- [templates/src/db/transaction.ts](templates/src/db/transaction.ts)
- [templates/src/repositories/user-repository.ts](templates/src/repositories/user-repository.ts)
- [templates/src/modules/users/users.repository.ts](templates/src/modules/users/users.repository.ts)
- [templates/src/cache/redis.ts](templates/src/cache/redis.ts)
- [examples/postgres-route.md](examples/postgres-route.md)
- [examples/transactional-service.md](examples/transactional-service.md)
- [examples/redis-cache.md](examples/redis-cache.md)
- [checklists/data-access-review.md](checklists/data-access-review.md)
- [checklists/database-lifecycle-review.md](checklists/database-lifecycle-review.md)
- [scripts/db-smoke-test.mjs](scripts/db-smoke-test.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
