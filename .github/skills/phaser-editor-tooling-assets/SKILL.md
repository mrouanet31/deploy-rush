---
name: phaser-editor-tooling-assets
description: Work with Phaser tooling, Phaser Editor, asset pipelines, Tiled, TexturePacker, Aseprite, linting, formatting, content iteration and generated asset manifests.
argument-hint: [project path or task]
---

# Editor Tooling and Asset Workflow

Use this skill when the user asks to improve content production loops by separating authored assets, generated assets, manifests, editor data and runtime code.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Tooling map](./references/tooling-map.md)
- [Source vs runtime assets](./references/asset-source-vs-runtime.md)
- [Tiled workflow](./references/tiled-workflow.md)
- [Content iteration](./references/content-iteration.md)
- Template: [Asset folder README](./templates/assets/README.md)
- Template: [Generate asset manifest](./templates/tools/generate_asset_manifest.py)
- Example: [Tiled object spawn](./examples/tiled-object-spawn.md)
- Example: [Preview scene](./examples/preview-scene.md)
- Checklist: [Tooling/assets review](./checklists/tooling-assets-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
