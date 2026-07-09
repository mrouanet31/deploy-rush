/**
 * Submission validation: schema checks, anti-cheat plausibility limits and
 * handle moderation. Pure functions, no I/O — easy to unit test.
 */

/** Titles the client can legitimately produce (see ScoreSystem). */
const ALLOWED_TITLES = new Set([
  'Build Guardian',
  'Deploy Master',
  'Incident Survivor',
  'Refactor Hero',
  'Prod Savior',
  'Chaos Engineer',
  'Software Craftsman'
]);

const ALLOWED_DIFFICULTIES = new Set(['normal', 'hard', 'conference']);

const ALLOWED_BADGES = new Map([
  ['clean-deploy', {
    id: 'clean-deploy',
    label: 'Clean Deploy',
    description: 'No major incidents and both gauges survived.'
  }],
  ['combo-engine', {
    id: 'combo-engine',
    label: 'Combo Engine',
    description: 'Reached a best combo of 12 or more.'
  }],
  ['wave-rider', {
    id: 'wave-rider',
    label: 'Wave Rider',
    description: 'Cleared every incident wave.'
  }],
  ['debt-slayer', {
    id: 'debt-slayer',
    label: 'Debt Slayer',
    description: 'Finished with tech debt at 10 or below.'
  }],
  ['steady-hands', {
    id: 'steady-hands',
    label: 'Steady Hands',
    description: 'Completed the run without wrong keys.'
  }],
  ['prod-saver', {
    id: 'prod-saver',
    label: 'Prod Saver',
    description: 'Kept production health at 85 or above.'
  }],
  ['hotfix-hunter', {
    id: 'hotfix-hunter',
    label: 'Hotfix Hunter',
    description: 'Used two or more power-ups.'
  }],
  ['ship-it', {
    id: 'ship-it',
    label: 'Ship It',
    description: 'Completed the shift and logged a score.'
  }]
]);

// Anti-cheat bounds. Deliberately generous so real runs are never rejected,
// but absurd values (e.g. score 10_000_000) are.
const MAX_DURATION = 600; // seconds (design target: a run is < 10 min)
const MAX_SCORE_PER_SECOND = 700; // generous ceiling on sustained scoring
const SCORE_HEADROOM = 3000; // flat allowance for end-of-run bonuses
const MAX_NAME_LEN = 12;

// Small, tasteful moderation list. Extend via EXTRA_BLOCKLIST (comma list).
const BASE_BLOCKLIST = [
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'nigger',
  'nigga',
  'faggot',
  'rape',
  'nazi',
  'hitler',
  'putain',
  'connard',
  'enculé',
  'encule'
];

const RESERVED_NAMES = new Set(['admin', 'root', 'system', 'moderator', 'null', 'undefined']);

/**
 * @param {unknown} body
 * @param {{ now?: Date, blocklist?: string[] }} [opts]
 * @returns {{ ok: true, value: object } | { ok: false, status: number, error: string }}
 */
export function validateSubmission(body, opts = {}) {
  const now = opts.now ?? new Date();
  const extra = opts.blocklist ?? [];

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return fail(400, 'body must be a JSON object');
  }

  // --- name / moderation ---
  const nameCheck = moderateName(body.name, extra);
  if (!nameCheck.ok) return nameCheck;
  const name = nameCheck.value;

  // --- duration ---
  const duration = toInt(body.duration);
  if (duration === null || duration < 0 || duration > MAX_DURATION) {
    return fail(400, 'duration out of range');
  }

  // --- score (with anti-cheat plausibility cap) ---
  const score = toInt(body.score);
  if (score === null || score < 0) {
    return fail(400, 'score out of range');
  }
  const maxPlausible = MAX_SCORE_PER_SECOND * Math.max(duration, 1) + SCORE_HEADROOM;
  if (score > maxPlausible) {
    return fail(422, 'score is implausible for the reported duration');
  }

  // --- difficulty ---
  const difficulty = ALLOWED_DIFFICULTIES.has(body.difficulty) ? body.difficulty : 'conference';

  // --- title (coerce unknown titles rather than reject) ---
  const rawTitle = typeof body.title === 'string' ? body.title : '';
  const title = ALLOWED_TITLES.has(rawTitle) ? rawTitle : 'Chaos Engineer';

  // --- badges (canonicalize known badge ids, drop unknowns) ---
  const badges = normalizeBadges(body.badges);

  // --- daily + seed window ---
  const daily = Boolean(body.daily);
  const seed = toInt(body.seed);
  if (daily) {
    if (seed === null) return fail(400, 'daily submissions require a seed');
    const today = seedForDate(now);
    const yesterday = seedForDate(new Date(now.getTime() - 24 * 3600 * 1000));
    if (seed !== today && seed !== yesterday) {
      return fail(422, 'daily seed is not for the current challenge');
    }
  }

  return {
    ok: true,
    value: { name, score, duration, title, badges, difficulty, daily, seed: seed ?? 0 }
  };
}

function normalizeBadges(raw) {
  if (!Array.isArray(raw)) return [];

  const badges = [];
  const seen = new Set();
  for (const item of raw) {
    const id =
      typeof item === 'string'
        ? item
        : typeof item?.id === 'string'
          ? item.id
          : '';
    const badge = ALLOWED_BADGES.get(id);
    if (!badge || seen.has(badge.id)) continue;
    seen.add(badge.id);
    badges.push({ ...badge });
    if (badges.length >= 5) break;
  }
  return badges;
}

function moderateName(raw, extra) {
  if (typeof raw !== 'string') return fail(400, 'name is required');
  const cleaned = raw
    .replace(/[^a-zA-Z0-9 _\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LEN);
  if (!cleaned) return fail(400, 'name is empty after sanitization');

  const normalized = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (RESERVED_NAMES.has(normalized)) {
    return fail(400, 'name is reserved');
  }
  const list = [...BASE_BLOCKLIST, ...extra].map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const word of list) {
    if (word && normalized.includes(word)) {
      return fail(400, 'name is not allowed');
    }
  }
  return { ok: true, value: cleaned };
}

/** YYYYMMDD integer for a date. */
export function seedForDate(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function toInt(value) {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isInteger(n) ? n : null;
}

function fail(status, error) {
  return { ok: false, status, error };
}
