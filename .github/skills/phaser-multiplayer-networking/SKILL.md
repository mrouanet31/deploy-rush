---
name: phaser-multiplayer-networking
description: Design and implement Phaser networking: WebSocket clients, authoritative servers, prediction, interpolation, rooms, matchmaking, sync, replay, security and anti-cheat boundaries.
argument-hint: [project path or task]
---

# Multiplayer and Networking

Use this skill when the user asks to add networked gameplay without coupling Phaser rendering to transport details; keep authority, prediction, interpolation and validation explicit.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Network architecture](./references/network-architecture.md)
- [Protocol design](./references/protocol-design.md)
- [Phaser client boundaries](./references/phaser-client-boundaries.md)
- [Security and anti-cheat](./references/security-anti-cheat.md)
- Template: [Typed WebSocket client](./templates/NetworkClient.ts)
- Template: [Interpolation buffer](./templates/interpolation.md)
- Example: [Authoritative arcade pattern](./examples/authoritative-arcade.md)
- Example: [Turn-based pattern](./examples/turn-based.md)
- Checklist: [Multiplayer review](./checklists/multiplayer-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
