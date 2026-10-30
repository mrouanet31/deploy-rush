---
name: phaser-state-data-save
description: Design game state, score, progression, saves, registry usage, Data Manager usage, event sourcing, deterministic replay, settings, persistence and migration.
argument-hint: [project path or task]
---

# State, Data and Saves

Use this skill when the user asks to separate transient scene state from persistent game state and keep save data versioned, serializable, testable and browser-safe.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [State boundaries](./references/state-boundaries.md)
- [Data Manager and Registry](./references/data-manager-registry.md)
- [Save schema](./references/save-schema.md)
- [Determinism and replay](./references/determinism-replay.md)
- Template: [Versioned localStorage save service](./templates/SaveService.ts)
- Template: [Seeded RNG wrapper](./templates/SeededRandom.ts)
- Example: [Score state](./examples/score-state.md)
- Example: [Save migration](./examples/save-migration.md)
- Checklist: [State/save review](./checklists/state-save-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
