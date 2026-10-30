---
name: phaser-worlds-cameras-tilemaps
description: Build worlds, cameras, scrolling, parallax, tilemaps, collision layers, pathing, camera effects, minimaps, viewport logic, and level loading.
argument-hint: [project path or task]
---

# Worlds, Cameras and Tilemaps

Use this skill when the user asks to create playable worlds with clean tilemap pipelines, camera behavior, world bounds, parallax layers and stable coordinate systems.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [World coordinates](./references/world-coordinates.md)
- [Camera patterns](./references/camera-patterns.md)
- [Tilemap pipeline](./references/tilemap-pipeline.md)
- [Level loading](./references/level-streaming.md)
- Template: [Camera setup helper](./templates/CameraSetup.ts)
- Template: [Tilemap layer factory](./templates/TilemapLayerFactory.ts)
- Example: [Parallax level](./examples/parallax-level.md)
- Example: [Multiple cameras](./examples/multiple-cameras.md)
- Checklist: [World/camera/tilemap review](./checklists/world-camera-tilemap-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
