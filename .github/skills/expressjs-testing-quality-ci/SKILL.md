---
name: expressjs-testing-quality-ci
description: Use when adding or improving tests for Express.js apps: unit tests, Supertest integration tests, contract tests, auth tests, middleware tests, fixtures, CI, coverage, linting, and quality gates.
---

# Testing and quality

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when adding or improving tests for Express.js apps: unit tests, Supertest integration tests, contract tests, auth tests, middleware tests, fixtures, CI, coverage, linting, and quality gates.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Make Express behavior testable without binding tests to a live port unless the task explicitly needs networking.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/testing-strategy.md](references/testing-strategy.md)
- [references/supertest-patterns.md](references/supertest-patterns.md)
- [references/test-database.md](references/test-database.md)
- [references/ci-quality-gates.md](references/ci-quality-gates.md)
- [references/fixtures-mocking.md](references/fixtures-mocking.md)
- [templates/tests/app.test.ts](templates/tests/app.test.ts)
- [templates/tests/health.test.ts](templates/tests/health.test.ts)
- [templates/tests/auth.test.ts](templates/tests/auth.test.ts)
- [templates/tests/middleware.test.ts](templates/tests/middleware.test.ts)
- [templates/.github/workflows/ci.yml](templates/.github/workflows/ci.yml)
- [examples/supertest-no-listen.md](examples/supertest-no-listen.md)
- [examples/auth-test.md](examples/auth-test.md)
- [examples/contract-test.md](examples/contract-test.md)
- [checklists/test-plan-review.md](checklists/test-plan-review.md)
- [checklists/ci-review.md](checklists/ci-review.md)
- [scripts/test-app-smoke.mjs](scripts/test-app-smoke.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
