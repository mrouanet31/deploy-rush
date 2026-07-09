# Deploy Rush — Game Design

## Concept

You are a **Release Engineer** operating a live CI/CD pipeline. Software events
travel down a conveyor of pipeline stages. Your job: intercept each event in the
correct lane and apply the correct action fast enough, maximizing throughput
(score) while keeping the **build green** and **production healthy**.

The fantasy is the day-to-day tension of shipping software: features want to go
out, bugs and security findings pile up, prod occasionally catches fire, and
tech debt quietly makes everything worse. It's readable in seconds, thematically
honest, and arcade-fast.

Target session length: **3–5 minutes** (default 180s), single player, keyboard
or Xbox-style gamepad — ideal for a take-turns event/booth setting with a local
leaderboard and prizes for the top 3.

## Core loop

1. Events spawn on the right in one of five lanes.
2. They scroll left on the conveyor at a difficulty-driven speed.
3. The player moves vertically between lanes (`↑`/`↓` or D-pad/left stick) and
   can dodge (`←`/`→` or D-pad/left stick).
4. When an event is **aligned** with the player's lane and inside the
   **interception zone**, the player presses the required action key(s).
5. Correct handling → points × combo multiplier, feedback FX, gauge gains.
6. Wrong action → malus, combo reset, red flash + shake.
7. Ignored event (scrolls off-screen) → penalty scaled by severity.
8. Difficulty ramps continuously; the run ends on timer 0, build 0, or prod 0.

The most urgent aligned event (closest to the player) is the one an action
resolves, so the player prioritizes naturally.

## Lanes

`PLAN → CODE → TEST → SECURITY → DEPLOY`

Each event has a natural lane. As difficulty increases, events can spawn one lane
off, or start **drifting** to a neighbour mid-flight, forcing repositioning.

## Events

| Event             | Lane     | Required          | Success                         | Ignore                              | Wrong / danger                        |
| ----------------- | -------- | ----------------- | ------------------------------- | ----------------------------------- | ------------------------------------- |
| Feature           | DEPLOY   | `T` → `D`         | +100, +build, feature shipped   | small score + build hit             | Deploy w/o Test: heavy build/prod hit |
| Bug               | CODE     | `F`               | +80, +prod                      | −10 prod                            | −score                                |
| Broken Test       | TEST     | `T` / `F`         | +90, +5 build                   | −15 build                           | −build                                |
| Security Finding  | SECURITY | `B` / `F`         | +150                            | −20 prod, combo reset, incident     | −prod                                 |
| Merge Conflict    | CODE     | `A` → `F`         | +120                            | −build                              | −20 build                             |
| Prod Alert        | DEPLOY   | `R`               | +180, +10 prod                  | −25 prod, combo reset, incident     | −prod                                 |
| Tech Debt         | PLAN     | `A` / `F`         | +60, −10 tech debt              | +10 tech debt (faster spawns)       | +tech debt                            |
| Approval Required | SECURITY | `B` / `A`         | +70                             | −build                              | Deploy: −20 prod + incident           |
| Flaky Test        | TEST     | `A` → `T`         | +110, +build                    | −build                              | −build                                |
| Dependency Bump   | CODE     | `F` / `A`         | +70, −tech debt                 | +tech debt                          | −score                                |
| Dodgy PR          | CODE     | `B` / `A`         | +90                             | −build                              | Deploy: build/prod hit + incident      |

Security Finding and Prod Alert are **critical** (pulsing card, combo reset on
ignore). The full definitions live in `src/game/data/eventDefinitions.ts`.

## Power-ups

Rare pickups drift down the pipeline and are grabbed with `Space` or gamepad
`A`:

- **Coffee Break ☕** — slows the conveyor for ~5s, buying reaction time.
- **Hotfix ⚡** — instantly auto-resolves every critical currently on screen,
  which also chains a large combo boost.

They reuse the normal interception mechanic (a single `CONTEXT` step:
`Space` / gamepad `A`), so they add depth without new controls.

## Modes

- **Training Shift** — 60-second scripted run with guidance text and curated
  events: Bug, Feature, Tech Debt, Security Finding, Prod Alert, a mini wave,
  then a Release Train drill.
- **Local Duel** — 120-second same-screen 1v1, preceded by a ready-up lobby with
  controller status and distinct color picks. P1 uses gamepad 1, P2 uses
  gamepad 2, and both controllers are required. Both players race for the same
  shared pipeline. The interception timing is shared so neither side gets a
  positional advantage; whoever completes a card earns the points. Ignored
  cards punish both players equally, and the highest live score wins. The end
  screen compares both players side by side, including score gap, mistakes,
  incidents, power-ups, and stolen cards. In-flight cards show colored P1/P2
  target markers, with a contested label when both players are aligned on the
  same card.
- **Normal / Hard / Conference** — difficulty tiers chosen from the mode screen,
  with different shift lengths (2:30 / 3:00 / 3:30).
- **Daily Challenge** — the `conference` profile with the spawner seeded from the
  date, so the event *sequence* is identical for everyone that day.

Solo score runs can also use optional **run modifiers** selected with left/right
on the mode screen:

- **Classic** — default rules.
- **Fast Pipeline** — faster conveyor/spawns with a score multiplier.
- **Fragile Prod** — lower starting production, harsher penalties, higher score.
- **Tech Debt Surge** — starts with debt and extra pressure.
- **Precision Run** — large score multiplier, but mistakes hurt hard.

Training, Daily Challenge and Local Duel force fixed rules. Modified runs are
stored in separate local leaderboard scopes and skipped for online classic
submission.

## Incident waves (boss moments)

Every ~40s (accelerating to ~25s with the difficulty ramp) a wave fires. A
2-second pre-alert pulses the affected lane(s) with a warning banner and alert
blip. Waves rotate deterministically through three patterns (fair for daily
runs), each landing with a banner and screen shake:

- **Incident burst** — critical events (`Prod Alert`, `Security Finding`,
  `On-call Page`) spread across lanes.
- **Storm** — one lane floods with the same event (Bug or Broken Test), scaling
  in count with difficulty.
- **Release Train** — a chained **mega event**: an oversized card requiring a
  four-step sequence (`A` `T` `B` `D`) that leaps to a nearby lane after each
  completed step, forcing the player to chase it across the pipeline for a big
  +400 payoff.

Waves are suppressed in the final 20 seconds so the closing stretch stays fair.

## Juice & audio

- **Particles** — additive-blended bursts with gravity, spin and expanding ring
  shockwaves for ships, mega releases and combos (a bloom-like glow over the dark
  backdrop; the player token and rings use additive blending too).
- **Music** — an optional procedural loop (bass + A-minor-pentatonic arpeggio,
  synthesized via Web Audio) whose intensity — a sparkle octave layer — rises
  with difficulty and combo. Toggle in Options, independent of SFX.
- **Reduced motion** — Options toggle that drops screen shake and full-screen
  flashes while keeping particles and floating text.
- **P1 input device** — auto-detected solo input. Any connected gamepad forces
  P1 to the first pad and swaps cards/menus to button labels; otherwise the
  game uses keyboard labels.
- **Gamepad name entry** — when a gamepad is present on the game-over screen, a
  compact virtual keyboard replaces the old character-cycling flow.

## Online leaderboards

An optional Express backend (`server/`) stores scores in **SQLite** (with a JSON
fallback) and serves a **global** board and per-day **daily** boards. The client
submits to both the local `localStorage` board and the backend; the Leaderboard
screen prefers the online board and falls back to local automatically when the
backend is down. Leaderboard rows surface compact run badges below each title so
players can see not just who scored highest, but how the run was achieved.

The backend is **hardened**: helmet security headers, a configurable CORS
allowlist, per-IP rate limiting, optional write auth via `SUBMIT_TOKEN`,
anti-cheat score validation (implausible score/duration/seed combinations are
rejected), handle moderation (profanity + reserved names), and salted IP hashing
at rest. It is tuned for a friendly booth deployment rather than a fully
adversarial public one.

## Scoring & combo

- Base points per event, scaled by a **combo multiplier** (x1→x5, +1 tier every
  4 consecutive successes).
- Any wrong action resets the combo. Critical ignores also reset it.
- Score can never go below 0 during a run.

End-of-run bonuses reward the *state* you finished in:

- Build bonus = `build × 4`
- Production bonus = `prod × 4`
- Tech debt bonus = `(100 − techDebt) × 2`
- Features bonus = `featuresShipped × 40`
- Combo bonus = `bestCombo × 10`
- Clean run = `+500` if no major incident and both gauges survived

A **title** summarizes the run (Build Guardian, Deploy Master, Incident Survivor,
Refactor Hero, Prod Savior, Chaos Engineer, Software Craftsman).

Compact **run badges** add a second layer of feedback on the game-over screen.
They reward notable patterns such as a clean deploy, 12+ combo, clearing every
wave, finishing with very low tech debt, avoiding wrong keys, keeping production
high, or using multiple power-ups.

## Balancing

Tuning knobs (all data-driven):

- **`difficultyProfiles.ts`** — spawn interval (base→min), speed (base→max), ramp
  duration, lane-drift probability, match duration.
- **`eventDefinitions.ts`** — points, gauge deltas, spawn weight, required
  sequence, dangerous actions.
- **`constants.ts`** — gauge maximums, combo steps, interception zone size,
  match geometry.

Design intent:

- **Criticals are high value, high punishment** to create moment-to-moment
  tension and reward lane discipline.
- **Tech debt is a slow-burn feedback loop**: ignoring it accelerates spawns,
  nudging players to invest in it.
- **The clean-run bonus** makes "playing safe" a viable high-score strategy
  alongside aggressive combo chaining.
- **Conference profile** is the default: fast enough to be exciting in ~3 minutes,
  forgiving enough that first-timers can learn within a single run.

## Feedback

- Positive: colored particle burst, score float, player squash, combo pops.
- Negative: red screen flash + camera shake; heavier "incident" shake for prod
  hits.
- Feature shipped: bright green burst + "SHIPPED" label.
- Synthetic Web Audio blips per outcome, toggleable.

## Post-MVP ideas

- Remappable keys and a colour-blind-safe palette (the game already leans on
  shapes, labels and key hints rather than colour alone).
- Backend at scale: user accounts/OAuth, a managed database, cryptographic
  proof-of-play anti-cheat, replay validation, and handle moderation tooling.
