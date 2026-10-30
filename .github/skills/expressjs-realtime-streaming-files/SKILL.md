---
name: expressjs-realtime-streaming-files
description: Use when adding Server-Sent Events, WebSockets/Socket.IO integration, HTTP streaming, uploads, downloads, multipart forms, backpressure, or long-lived connections to an Express.js app.
---

# Realtime, streaming, and files

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when adding Server-Sent Events, WebSockets/Socket.IO integration, HTTP streaming, uploads, downloads, multipart forms, backpressure, or long-lived connections to an Express.js app.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Handle long-lived and file-heavy traffic without blocking the event loop or bypassing security controls.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/sse.md](references/sse.md)
- [references/websockets.md](references/websockets.md)
- [references/node-streams.md](references/node-streams.md)
- [references/uploads-downloads.md](references/uploads-downloads.md)
- [references/backpressure-abort.md](references/backpressure-abort.md)
- [templates/src/realtime/sse.ts](templates/src/realtime/sse.ts)
- [templates/src/realtime/websocket.ts](templates/src/realtime/websocket.ts)
- [templates/src/files/upload.ts](templates/src/files/upload.ts)
- [templates/src/files/download.ts](templates/src/files/download.ts)
- [templates/src/files/storage.ts](templates/src/files/storage.ts)
- [examples/sse-heartbeat.md](examples/sse-heartbeat.md)
- [examples/safe-multer.md](examples/safe-multer.md)
- [examples/stream-pipeline.md](examples/stream-pipeline.md)
- [checklists/realtime-review.md](checklists/realtime-review.md)
- [checklists/file-transfer-review.md](checklists/file-transfer-review.md)
- [scripts/stream-load-test.mjs](scripts/stream-load-test.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
