---
name: expressjs-deployment-containers-cloud
description: Use when containerizing or deploying Express.js to Docker, Kubernetes, Cloud Run, PaaS, systemd, PM2, reverse proxies, or cloud environments with env config, secrets, health checks, and graceful termination.
---

# Deployment, containers, and cloud

# How this skill is designed

This is a **coding-assistant skill** for building, reviewing, or operating Express.js applications. It is not runtime application code and should not be copied blindly into a project. Load the linked resources only when the task requires them.

**Default baseline:** Express 5.x, Node.js 18+, ESM or TypeScript unless the existing project is CommonJS. Preserve the existing project style when editing an established codebase.


## Use this skill when
- Use when containerizing or deploying Express.js to Docker, Kubernetes, Cloud Run, PaaS, systemd, PM2, reverse proxies, or cloud environments with env config, secrets, health checks, and graceful termination.
- The user asks to implement, review, debug, test, migrate, or productionize code in this area.
- The target repository is an Express.js app, API, gateway, BFF, service, or middleware package.

## Mission
Package and run Express consistently across environments with explicit health, config, secrets, logging, and shutdown semantics.

## Do first
1. Inspect the existing project style: Express version, Node version, package manager, TypeScript/ESM/CommonJS, test runner, lint setup, and deployment target.
2. Prefer the smallest change that preserves public HTTP behavior unless the user explicitly asks for redesign.
3. Load only the local files needed for the current task.

## Local resources
- [references/deployment-models.md](references/deployment-models.md)
- [references/containerization.md](references/containerization.md)
- [references/kubernetes-cloud.md](references/kubernetes-cloud.md)
- [references/process-managers.md](references/process-managers.md)
- [references/env-secrets.md](references/env-secrets.md)
- [templates/Dockerfile](templates/Dockerfile)
- [templates/.dockerignore](templates/.dockerignore)
- [templates/k8s/deployment.yaml](templates/k8s/deployment.yaml)
- [templates/k8s/service.yaml](templates/k8s/service.yaml)
- [templates/k8s/configmap.yaml](templates/k8s/configmap.yaml)
- [templates/k8s/secret.example.yaml](templates/k8s/secret.example.yaml)
- [templates/systemd/express.service](templates/systemd/express.service)
- [examples/cloud-run.md](examples/cloud-run.md)
- [examples/kubernetes-readiness.md](examples/kubernetes-readiness.md)
- [examples/pm2-cluster.md](examples/pm2-cluster.md)
- [checklists/deployment-review.md](checklists/deployment-review.md)
- [checklists/container-review.md](checklists/container-review.md)
- [scripts/docker-smoke-test.sh](scripts/docker-smoke-test.sh)

## Default engineering rules
- Do not start a listener in files that tests must import; export an app factory or app instance separately from `server.listen`.
- Validate untrusted input before domain logic.
- Put authn/authz before protected routes and error middleware after route handlers.
- Use centralized error handling and do not expose stack traces in production responses.
- Use explicit body limits, upload limits, timeouts, request IDs, logging, and health endpoints for production services.
- When using examples, adapt them to the repository's conventions instead of copying blindly.
