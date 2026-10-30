---
name: phaser-build-deploy-pwa
description: Prepare Phaser games for production: Vite builds, asset paths, static hosting, CDN, caching, PWA/service workers, fullscreen, orientation, analytics, and release packaging.
argument-hint: [project path or task]
---

# Build, Deploy and PWA

Use this skill when the user asks to ship Phaser games reliably on web hosting targets with correct asset base paths, cache strategy, mobile metadata, PWA behavior and CI release checks.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Build targets](./references/build-targets.md)
- [Asset paths and caching](./references/asset-paths-caching.md)
- [PWA and mobile web](./references/pwa-mobile-web.md)
- [Release process](./references/release-process.md)
- Template: [Vite config](./templates/vite.config.ts)
- Template: [PWA manifest](./templates/public/manifest.webmanifest)
- Example: [GitHub Pages deploy](./examples/github-pages.md)
- Example: [itch.io packaging](./examples/itchio.md)
- Checklist: [Release checklist](./checklists/release-checklist.md)
- Script: [Verify dist](./scripts/verify_dist.py)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
