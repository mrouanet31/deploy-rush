---
name: expressjs-request-response-api
description: Use when implementing handlers that depend on req/res APIs, headers, cookies, content negotiation, redirects, downloads, static assets, response locals, streaming, or file transfers.
---

# Request and response API

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when implementing handlers that depend on req/res APIs, headers, cookies, content negotiation, redirects, downloads, static assets, response locals, streaming, or file transfers.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Use Express request/response APIs deliberately without leaking filesystem paths, unsafe redirects, double responses, or fragile header behavior.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/request-api.md](references/request-api.md)
- [references/response-api.md](references/response-api.md)
- [references/headers-cookies.md](references/headers-cookies.md)
- [references/files-streaming.md](references/files-streaming.md)
- [references/double-response.md](references/double-response.md)
- [templates/src/http/respond.ts](templates/src/http/respond.ts)
- [templates/src/http/problem.ts](templates/src/http/problem.ts)
- [templates/src/http/download.ts](templates/src/http/download.ts)
- [templates/src/http/cookies.ts](templates/src/http/cookies.ts)
- [examples/json-response-patterns.md](examples/json-response-patterns.md)
- [examples/safe-download.md](examples/safe-download.md)
- [examples/streaming-response.md](examples/streaming-response.md)
- [checklists/handler-review.md](checklists/handler-review.md)
- [checklists/response-safety.md](checklists/response-safety.md)
- [scripts/detect-double-send.mjs](scripts/detect-double-send.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
