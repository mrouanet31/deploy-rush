---
name: phaser-physics-arcade-matter
description: Implement or debug Arcade Physics and Matter Physics, collisions, overlaps, bodies, sensors, constraints, tile collisions, collision categories, and physics performance.
argument-hint: [project path or task]
---

# Physics: Arcade and Matter

Use this skill when the user asks to choose Arcade for fast arcade-style games and Matter for complex rigid bodies/constraints; keep physics deterministic, debuggable and efficient.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Choosing a physics system](./references/physics-choice.md)
- [Arcade Physics](./references/arcade-physics.md)
- [Matter Physics](./references/matter-physics.md)
- [Collision design](./references/collision-design.md)
- [Physics performance](./references/physics-performance.md)
- Template: [Arcade player controller](./templates/ArcadePlayerController.ts)
- Template: [Collision groups template](./templates/collision-groups.md)
- Example: [Arcade bullet pool](./examples/arcade-bullets.md)
- Example: [Matter sensors](./examples/matter-sensors.md)
- Checklist: [Physics review](./checklists/physics-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
