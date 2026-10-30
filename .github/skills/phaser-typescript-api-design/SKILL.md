---
name: phaser-typescript-api-design
description: Design strongly typed Phaser TypeScript code: scene payloads, asset keys, custom game objects, event maps, module boundaries, generics, and strict compiler settings.
argument-hint: [project path or task]
---

# TypeScript API Design for Phaser

Use this skill when the user asks to make Phaser code safer and easier to refactor by typing string keys, events, scene data, systems, services and custom object factories.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Typing strategy](./references/typing-strategy.md)
- [Scene types](./references/scene-types.md)
- [Asset key types](./references/asset-key-types.md)
- [API boundaries](./references/api-boundaries.md)
- Template: [Typed asset keys](./templates/typed-keys.ts)
- Template: [Typed scene events](./templates/typed-scene-events.ts)
- Example: [Pure logic extraction](./examples/pure-logic-extraction.md)
- Example: [Typed asset helper](./examples/typed-asset-helper.md)
- Checklist: [TypeScript review](./checklists/typescript-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
