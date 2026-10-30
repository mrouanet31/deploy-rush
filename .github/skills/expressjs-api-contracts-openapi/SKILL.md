---
name: expressjs-api-contracts-openapi
description: Use when designing or maintaining REST/HTTP APIs with Express.js, OpenAPI specs, request/response validation, API versioning, error contracts, docs, SDK generation, or contract tests.
---

# API contracts and OpenAPI

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when designing or maintaining REST/HTTP APIs with Express.js, OpenAPI specs, request/response validation, API versioning, error contracts, docs, SDK generation, or contract tests.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Make Express routes contract-driven, documented, validated at runtime, and versioned intentionally.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/contract-first.md](references/contract-first.md)
- [references/openapi-integration.md](references/openapi-integration.md)
- [references/status-errors.md](references/status-errors.md)
- [references/versioning-compatibility.md](references/versioning-compatibility.md)
- [references/validation-strategy.md](references/validation-strategy.md)
- [templates/openapi/openapi.yaml](templates/openapi/openapi.yaml)
- [templates/src/openapi/validate-request.ts](templates/src/openapi/validate-request.ts)
- [templates/src/openapi/swagger-ui.ts](templates/src/openapi/swagger-ui.ts)
- [templates/src/http/problem.ts](templates/src/http/problem.ts)
- [examples/route-from-contract.md](examples/route-from-contract.md)
- [examples/contract-test.md](examples/contract-test.md)
- [examples/versioned-api.md](examples/versioned-api.md)
- [checklists/api-contract-review.md](checklists/api-contract-review.md)
- [checklists/breaking-change-review.md](checklists/breaking-change-review.md)
- [scripts/lint-openapi.mjs](scripts/lint-openapi.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
