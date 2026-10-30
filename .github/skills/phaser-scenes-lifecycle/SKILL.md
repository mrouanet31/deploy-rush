---
name: phaser-scenes-lifecycle
description: Implement, review, or debug Phaser Scenes, lifecycle callbacks, scene transitions, overlays, pause/resume, shutdown cleanup, and cross-scene coordination.
argument-hint: [project path or task]
---

# Scenes and Lifecycle

Use this skill when the user asks to use Scenes as self-contained game worlds and manage lifecycle cleanup, transitions, overlays, and data handoff safely.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Scene model](./references/scene-model.md)
- [Lifecycle callbacks](./references/lifecycle-callbacks.md)
- [Transitions and overlays](./references/transitions-overlays.md)
- [Cleanup and memory](./references/cleanup-and-memory.md)
- Template: [Lifecycle-safe base scene](./templates/BaseScene.ts)
- Template: [Typed scene payload](./templates/ScenePayload.ts)
- Example: [HUD overlay pattern](./examples/hud-overlay.md)
- Example: [Pause menu pattern](./examples/pause-menu.md)
- Checklist: [Scene lifecycle checklist](./checklists/scene-lifecycle-checklist.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
