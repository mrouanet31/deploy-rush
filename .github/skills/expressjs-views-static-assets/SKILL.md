---
name: expressjs-views-static-assets
description: Use when serving static files, configuring template engines, rendering HTML, integrating SPAs, caching assets, handling public directories, or reviewing view-related filesystem risks.
---

# Views and static assets

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when serving static files, configuring template engines, rendering HTML, integrating SPAs, caching assets, handling public directories, or reviewing view-related filesystem risks.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Serve HTML and static assets efficiently and safely while keeping user input out of filesystem-sensitive APIs.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/static-assets.md](references/static-assets.md)
- [references/template-engines.md](references/template-engines.md)
- [references/cache-control.md](references/cache-control.md)
- [references/spa-fallback.md](references/spa-fallback.md)
- [references/filesystem-risks.md](references/filesystem-risks.md)
- [templates/src/views/configure-views.ts](templates/src/views/configure-views.ts)
- [templates/src/static/static-assets.ts](templates/src/static/static-assets.ts)
- [templates/src/static/spa-fallback.ts](templates/src/static/spa-fallback.ts)
- [templates/views/layout.pug](templates/views/layout.pug)
- [templates/public/README.md](templates/public/README.md)
- [examples/pug-rendering.md](examples/pug-rendering.md)
- [examples/static-prefix.md](examples/static-prefix.md)
- [examples/spa-deployment.md](examples/spa-deployment.md)
- [checklists/views-review.md](checklists/views-review.md)
- [checklists/static-assets-review.md](checklists/static-assets-review.md)
- [scripts/check-static-cache.mjs](scripts/check-static-cache.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
