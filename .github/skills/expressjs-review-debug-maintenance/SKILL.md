---
name: expressjs-review-debug-maintenance
description: Use when auditing, debugging, reviewing, or maintaining an existing Express.js codebase for route bugs, middleware order issues, security gaps, performance bottlenecks, tests, production readiness, or migration risk.
---

# Review, debug, and maintenance

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when auditing, debugging, reviewing, or maintaining an existing Express.js codebase for route bugs, middleware order issues, security gaps, performance bottlenecks, tests, production readiness, or migration risk.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Triage Express systems systematically: reproduce, inspect the pipeline, isolate the fault, patch narrowly, and add regression coverage.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/debug-playbook.md](references/debug-playbook.md)
- [references/code-review-rubric.md](references/code-review-rubric.md)
- [references/incident-triage.md](references/incident-triage.md)
- [references/anti-patterns.md](references/anti-patterns.md)
- [references/maintenance-strategy.md](references/maintenance-strategy.md)
- [templates/reports/express-review.md](templates/reports/express-review.md)
- [templates/reports/incident-postmortem.md](templates/reports/incident-postmortem.md)
- [templates/tests/regression-template.test.ts](templates/tests/regression-template.test.ts)
- [examples/headers-already-sent.md](examples/headers-already-sent.md)
- [examples/hanging-request.md](examples/hanging-request.md)
- [examples/cors-failure.md](examples/cors-failure.md)
- [checklists/review-checklist.md](checklists/review-checklist.md)
- [checklists/debug-checklist.md](checklists/debug-checklist.md)
- [checklists/maintenance-checklist.md](checklists/maintenance-checklist.md)
- [scripts/express-audit.mjs](scripts/express-audit.mjs)
- [scripts/route-repro.mjs](scripts/route-repro.mjs)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
