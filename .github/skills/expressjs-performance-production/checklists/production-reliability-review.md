# Performance and production reliability — Production Reliability Review checklist

Use this checklist before claiming the Express.js work is complete.

## Correctness
- [ ] The route/middleware order is explicit and deterministic.
- [ ] The app can be imported without starting an HTTP listener.
- [ ] Request input is validated at runtime before use.
- [ ] Response status codes and payload shapes match the intended contract.
- [ ] Async errors are propagated to centralized error handling.

## Security
- [ ] No secrets, tokens, passwords, or stack traces are exposed to clients.
- [ ] Headers/cookies/CORS/session settings match the deployment trust boundary.
- [ ] Body size, upload size, and rate limits are intentional.
- [ ] Redirects, file paths, and template names are not controlled directly by user input.
- [ ] Dependency choices are justified and maintained.

## Production readiness
- [ ] Health/readiness behavior is clear.
- [ ] SIGTERM/shutdown behavior closes server and external resources.
- [ ] Structured logs or debug traces identify request failures.
- [ ] The implementation has unit/integration tests or an explicit manual verification script.
- [ ] Documentation or README notes describe required environment variables.
