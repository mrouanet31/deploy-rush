---
name: phaser-new-game
description: Create a new Phaser game or integrate Phaser into an existing TypeScript/Vite project. Use when asked to scaffold, bootstrap, structure, configure, or start a Phaser game project.
argument-hint: [project path or task]
---

# New Phaser Game

Use this skill when the user asks to scaffold modern Phaser projects with TypeScript, Vite, asset folders, scenes, build scripts, lint/test setup, and production-ready config.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Project setup](./references/project-setup.md)
- [Game configuration](./references/game-config.md)
- [Project layout](./references/project-layout.md)
- [Versioning and docs](./references/versioning-and-docs.md)
- Template: [Package manifest](./templates/vite-typescript-game/package.json)
- Template: [Minimal Phaser entry](./templates/vite-typescript-game/src/main.ts)
- Template: [Boot scene](./templates/vite-typescript-game/src/scenes/BootScene.ts)
- Template: [Preload scene](./templates/vite-typescript-game/src/scenes/PreloadScene.ts)
- Template: [Game scene](./templates/vite-typescript-game/src/scenes/GameScene.ts)
- Template: [HTML shell](./templates/vite-typescript-game/index.html)
- Example: [Small arcade skeleton](./examples/small-arcade-skeleton.md)
- Example: [Embedding Phaser in React](./examples/existing-react-host.md)
- Checklist: [New game checklist](./checklists/new-game-checklist.md)
- Script: [Check Phaser project](./scripts/check_phaser_project.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
