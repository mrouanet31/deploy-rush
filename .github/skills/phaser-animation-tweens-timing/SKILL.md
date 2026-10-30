---
name: phaser-animation-tweens-timing
description: Develop spritesheet animations, animation managers, tweens, timelines, timers, delayed calls, effects, cooldowns, deterministic timing and cleanup.
argument-hint: [project path or task]
---

# Animation, Tweens and Timing

Use this skill when the user asks to coordinate visual animation, gameplay timing and Scene lifecycle without leaking timers or mixing animation events with core state rules.

## Operating rules

- This skill is for a coding assistant that develops Phaser projects. It is not a Phaser runtime plugin.
- Inspect the local project before editing: `package.json`, installed `phaser` version, bundler, `src/`, scenes, assets and tests.
- Do not load every resource. Open only the references/templates/examples needed for the current task.
- Prefer TypeScript, explicit scene lifecycles, typed asset keys, small systems and deterministic behavior.
- Do not copy old Phaser 2 State/World patterns into modern Phaser code.
- When changing gameplay behavior, preserve the user's design intent and make the smallest safe patch.

## Local resources

- [Animations](./references/animations.md)
- [Tweens and timelines](./references/tweens-and-timelines.md)
- [Timers and clock](./references/timers-and-clock.md)
- [State machines](./references/state-machines.md)
- Template: [Animation registration helper](./templates/AnimationRegistry.ts)
- Template: [Cooldown timer](./templates/Cooldown.ts)
- Example: [Enemy state machine](./examples/enemy-state-machine.md)
- Example: [Hit flash tween](./examples/hit-flash-tween.md)
- Checklist: [Animation/timing review](./checklists/animation-timing-review.md)

## Output expected from the coding assistant

- Concrete code edits or a precise patch plan.
- Version-sensitive notes when APIs may differ across Phaser versions.
- A validation command, smoke test, or manual test path.
- Any residual risk, especially around asset loading, scene lifecycle, mobile browsers, or performance.
