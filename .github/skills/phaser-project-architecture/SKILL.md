---
name: phaser-project-architecture
description: Design or refactor Phaser game architecture: scenes, systems, prefabs, services, events, state boundaries, asset ownership, and maintainable TypeScript structure.
argument-hint: [project path or task]
---

# Project Architecture

Use this skill when the user asks to organize game code so gameplay, presentation, physics, audio, UI, persistence, and platform integrations stay testable and evolvable.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Architecture patterns](./references/architecture-patterns.md)
- [Scene boundaries](./references/scene-boundaries.md)
- [Game loop boundaries](./references/game-loop-boundaries.md)
- [Anti-patterns](./references/anti-patterns.md)
- Template: [Typed event bus](./templates/src/systems/EventBus.ts)
- Template: [Asset key registry](./templates/src/config/assetKeys.ts)
- Example: [Scene stack example](./examples/scene-stack-example.md)
- Example: [System extraction](./examples/system-extraction-example.md)
- Checklist: [Architecture review](./checklists/architecture-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
