---
name: phaser-assets-loader-pipeline
description: Design or debug Phaser asset loading: images, atlases, spritesheets, audio, JSON, tilemaps, fonts, preload bars, caches, key naming, lazy loading, and asset optimization.
argument-hint: [project path or task]
---

# Assets and Loader Pipeline

Use this skill when the user asks to build stable asset pipelines with consistent keys, preload strategies, cache management, loading UI, and production asset optimization.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Loader strategy](./references/loader-strategy.md)
- [Asset types](./references/asset-types.md)
- [Cache and keys](./references/cache-and-keys.md)
- [Asset optimization](./references/optimization.md)
- Template: [Preload progress UI](./templates/PreloadProgress.ts)
- Template: [Asset manifest](./templates/asset-manifest.json)
- Example: [Lazy-load level assets](./examples/lazy-load-level.md)
- Example: [Atlas vs spritesheet](./examples/atlas-vs-spritesheet.md)
- Checklist: [Asset pipeline checklist](./checklists/asset-pipeline-checklist.md)
- Script: [List asset key constants](./scripts/list_asset_keys.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
