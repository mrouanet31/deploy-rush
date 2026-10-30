---
name: phaser-performance-mobile
description: Profile and optimize Phaser games for desktop and mobile: frame budget, GC, textures, draw calls, physics load, object pools, scale modes, input latency and browser limits.
argument-hint: [project path or task]
---

# Performance and Mobile Optimization

Use this skill when the user asks to keep Phaser games smooth by managing object counts, allocations, textures, physics, rendering effects and mobile browser constraints.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Performance budget](./references/performance-budget.md)
- [Rendering optimization](./references/rendering-optimization.md)
- [Mobile constraints](./references/mobile-constraints.md)
- [Physics optimization](./references/physics-optimization.md)
- Template: [Simple performance HUD](./templates/PerformanceHud.ts)
- Template: [Pooling checklist template](./templates/pool.md)
- Example: [Mobile-first config](./examples/mobile-first-config.md)
- Example: [GC spike audit](./examples/gc-spike-audit.md)
- Checklist: [Performance review](./checklists/performance-review.md)
- Script: [Scan update allocations](./scripts/scan_update_allocations.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
