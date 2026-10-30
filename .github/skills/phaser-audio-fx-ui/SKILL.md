---
name: phaser-audio-fx-ui
description: Implement audio, music, sound effects, mixers, UI overlays, HUDs, menus, text, localization, game feel, feedback, particles, camera effects, and juice.
argument-hint: [project path or task]
---

# Audio, FX and UI

Use this skill when the user asks to build polished game feedback and UI with audio lifecycle, HUD overlays, scene-safe controls, responsive layout and accessible presentation.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Audio lifecycle](./references/audio-lifecycle.md)
- [UI scenes](./references/ui-scenes.md)
- [Game feel](./references/game-feel.md)
- [Localization and accessibility](./references/localization-accessibility.md)
- Template: [Audio facade](./templates/AudioService.ts)
- Template: [HUD scene template](./templates/HudScene.ts)
- Example: [Juice pass](./examples/juice-pass.md)
- Example: [Settings menu](./examples/settings-menu.md)
- Checklist: [Audio/UI review](./checklists/audio-ui-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
