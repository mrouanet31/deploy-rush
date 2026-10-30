---
name: phaser-input-controls
description: Implement keyboard, pointer, touch, gamepad, drag/drop, gestures, cursors, accessibility-friendly controls, input mapping, rebinding, and deterministic control handling.
argument-hint: [project path or task]
---

# Input and Controls

Use this skill when the user asks to build reliable input systems that work across keyboard, mouse, touch, gamepad, mobile browsers, overlays, and paused scenes.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Input systems](./references/input-systems.md)
- [Control mapping](./references/control-mapping.md)
- [Mobile and browser](./references/mobile-and-browser.md)
- [Accessibility](./references/accessibility.md)
- Template: [Action-based keyboard mapper](./templates/InputActions.ts)
- Example: [Keyboard-only arcade controls](./examples/keyboard-only-arcade.md)
- Example: [Drag/drop interactions](./examples/pointer-drag.md)
- Checklist: [Input checklist](./checklists/input-checklist.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
