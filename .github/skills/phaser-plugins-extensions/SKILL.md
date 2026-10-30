---
name: phaser-plugins-extensions
description: Create, integrate, review, or debug Phaser plugins, scene plugins, global plugins, custom systems, reusable game modules, external libraries and extension points.
argument-hint: [project path or task]
---

# Plugins and Extensions

Use this skill when the user asks to package reusable Phaser behavior with explicit lifecycle, dependency boundaries and typed APIs instead of hidden global side effects.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Plugin types](./references/plugin-types.md)
- [Lifecycle and cleanup](./references/lifecycle-and-cleanup.md)
- [Typed extension API](./references/typed-extension-api.md)
- [Integration risk](./references/integration-risk.md)
- Template: [Scene plugin template](./templates/ScenePluginTemplate.ts)
- Template: [Reusable module API](./templates/module-api.md)
- Example: [Camera effects plugin](./examples/camera-effects-plugin.md)
- Example: [Debug panel plugin](./examples/debug-panel-plugin.md)
- Checklist: [Plugins review](./checklists/plugins-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
