---
name: phaser-game-objects-display
description: Develop or review Phaser Game Objects, display lists, Containers, Groups, Layers, depth sorting, transforms, masks, shaders, particles, text, and custom objects.
argument-hint: [project path or task]
---

# Game Objects and Display

Use this skill when the user asks to use Phaser's display model effectively while avoiding costly Containers, runaway object counts, and hard-to-debug depth/order bugs.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Display list](./references/display-list.md)
- [Groups, containers and layers](./references/groups-containers-layers.md)
- [Custom Game Objects](./references/custom-game-objects.md)
- [Text, particles and FX](./references/text-particles-fx.md)
- Template: [Pooled sprite pattern](./templates/PooledSprite.ts)
- Template: [Scene factory helper](./templates/object-factory.ts)
- Example: [Depth policy](./examples/depth-policy.md)
- Example: [Object pooling](./examples/object-pooling.md)
- Checklist: [Display review](./checklists/display-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
