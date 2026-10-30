# Mobile-first config

Use Scale.FIT/CENTER_BOTH, avoid enormous canvas sizes, gate expensive FX, and offer reduced motion.

## Coding-assistant procedure

1. Inspect the existing project files before modifying code.
2. Confirm the installed Phaser version and TypeScript setup.
3. Use the smallest relevant template or pattern from this skill.
4. Preserve game-specific intent; do not replace gameplay design unless asked.
5. Add or update tests/checklists when the change affects behavior.

## Quality bar

- Keep Phaser Scene lifecycle explicit.
- Keep asset keys stable and typed when possible.
- Avoid hidden globals and duplicated listeners.
- Avoid allocations inside frame-hot update paths.
- Prefer small systems/services over God Scenes.
