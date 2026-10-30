---
name: phaser-testing-debugging
description: Add tests and debugging workflows for Phaser games: unit tests, deterministic simulation, scene smoke tests, Playwright/browser tests, physics debug, asset checks and regression harnesses.
argument-hint: [project path or task]
---

# Testing and Debugging

Use this skill when the user asks to test pure logic first, smoke-test Phaser scenes in browsers, validate assets and create repeatable debugging workflows for gameplay issues.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Testing strategy](./references/testing-strategy.md)
- [Debugging workflow](./references/debugging-workflow.md)
- [Browser tests](./references/browser-tests.md)
- [Common failures](./references/common-failures.md)
- Template: [Vitest pure logic test](./templates/tests/pure-score.test.ts)
- Template: [Playwright smoke test](./templates/tests/game-smoke.spec.ts)
- Example: [Missing asset debug](./examples/asset-missing-debug.md)
- Example: [Scene restart leak](./examples/scene-restart-leak-debug.md)
- Checklist: [Testing/debug checklist](./checklists/testing-debugging-checklist.md)
- Script: [Collect diagnostics](./scripts/collect_phaser_diagnostics.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
