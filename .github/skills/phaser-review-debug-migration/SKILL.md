---
name: phaser-review-debug-migration
description: Audit, review, debug, migrate or modernize existing Phaser codebases, including Phaser 2-to-modern patterns, Phaser 3-to-4 API changes, architecture smells, asset issues and performance regressions.
argument-hint: [project path or task]
---

# Review, Debug and Migration

Use this skill when the user asks to systematically inspect existing Phaser projects, identify outdated patterns, fix lifecycle/asset/performance bugs and produce safe migration plans.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Review method](./references/review-method.md)
- [Migration guide](./references/migration-guide.md)
- [Debug playbooks](./references/debug-playbooks.md)
- [Modernization plan](./references/modernization-plan.md)
- [Anti-pattern catalog](./references/anti-pattern-catalog.md)
- Template: [Review report](./templates/review-report-template.md)
- Template: [Migration plan](./templates/migration-plan-template.md)
- Example: [Phaser 2 State smell](./examples/phaser-2-state-smell.md)
- Example: [Black canvas debug](./examples/black-canvas-debug.md)
- Checklist: [Review/debug/migration checklist](./checklists/review-debug-migration-checklist.md)
- Script: [Audit Phaser codebase](./scripts/audit_phaser_codebase.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
