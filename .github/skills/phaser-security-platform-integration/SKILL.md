---
name: phaser-security-platform-integration
description: Secure and integrate Phaser games with browser/platform APIs: storage, auth handoff, backend APIs, analytics, privacy, CORS, CSP, iframe embedding, payments and untrusted input.
argument-hint: [project path or task]
---

# Security and Platform Integration

Use this skill when the user asks to treat Phaser as an untrusted browser client, secure platform boundaries, validate all backend interactions and keep privacy/security explicit.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Browser security](./references/browser-security.md)
- [Backend integration](./references/backend-integration.md)
- [Privacy and analytics](./references/privacy-analytics.md)
- [Monetization/platforms](./references/monetization-platforms.md)
- Template: [Score API client](./templates/ScoreApiClient.ts)
- Template: [Platform boundary](./templates/platform-boundary.md)
- Example: [Leaderboard security](./examples/leaderboard-security.md)
- Example: [Iframe embed](./examples/iframe-embed.md)
- Checklist: [Security/platform review](./checklists/security-platform-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
