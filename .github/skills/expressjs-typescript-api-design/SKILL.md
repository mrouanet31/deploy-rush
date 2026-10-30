---
name: expressjs-typescript-api-design
description: Use when implementing Express.js in TypeScript: typed handlers, Request/Response generics, declaration merging, typed params/query/body, validation libraries, ESM/CJS interop, or API boundaries.
---

# TypeScript API design

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when implementing Express.js in TypeScript: typed handlers, Request/Response generics, declaration merging, typed params/query/body, validation libraries, ESM/CJS interop, or API boundaries.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Keep Express TypeScript code strongly typed at boundaries while accepting that runtime validation is still mandatory.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/typescript-baseline.md](references/typescript-baseline.md)
- [references/request-response-generics.md](references/request-response-generics.md)
- [references/declaration-merging.md](references/declaration-merging.md)
- [references/runtime-validation.md](references/runtime-validation.md)
- [references/esm-cjs.md](references/esm-cjs.md)
- [templates/src/types/express.d.ts](templates/src/types/express.d.ts)
- [templates/src/http/typed-handler.ts](templates/src/http/typed-handler.ts)
- [templates/src/validation/zod.ts](templates/src/validation/zod.ts)
- [templates/src/modules/example/example.schema.ts](templates/src/modules/example/example.schema.ts)
- [templates/tsconfig.json](templates/tsconfig.json)
- [examples/typed-route.md](examples/typed-route.md)
- [examples/request-user-augmentation.md](examples/request-user-augmentation.md)
- [examples/schema-driven-handler.md](examples/schema-driven-handler.md)
- [checklists/typescript-review.md](checklists/typescript-review.md)
- [checklists/type-safety-boundary.md](checklists/type-safety-boundary.md)
- [scripts/typecheck.mjs](scripts/typecheck.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
