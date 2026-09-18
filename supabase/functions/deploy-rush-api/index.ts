import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

const MAX_LIMIT = 50;
const MAX_DURATION = 600;
const MAX_SCORE_PER_SECOND = 700;
const SCORE_HEADROOM = 3000;
const MAX_NAME_LEN = 12;

const ALLOWED_TITLES = new Set([
  "Build Guardian",
  "Deploy Master",
  "Incident Survivor",
  "Refactor Hero",
  "Prod Savior",
  "Chaos Engineer",
  "Software Craftsman"
]);

const ALLOWED_DIFFICULTIES = new Set(["normal", "hard", "conference"]);

const ALLOWED_BADGES = new Map([
  ["clean-deploy", ["Clean Deploy", "No major incidents and both gauges survived."]],
  ["combo-engine", ["Combo Engine", "Reached a best combo of 12 or more."]],
  ["wave-rider", ["Wave Rider", "Cleared every incident wave."]],
  ["debt-slayer", ["Debt Slayer", "Finished with tech debt at 10 or below."]],
  ["steady-hands", ["Steady Hands", "Completed the run without wrong keys."]],
  ["prod-saver", ["Prod Saver", "Kept production health at 85 or above."]],
  ["hotfix-hunter", ["Hotfix Hunter", "Used two or more power-ups."]],
  ["ship-it", ["Ship It", "Completed the shift and logged a score."]]
]);

const BASE_BLOCKLIST = [
  "fuck", "shit", "bitch", "cunt", "nigger", "nigga", "faggot",
  "rape", "nazi", "hitler", "putain", "connard", "enculé", "encule"
];

const RESERVED_NAMES = new Set(["admin", "root", "system", "moderator", "null", "undefined"]);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/functions\/v1\/deploy-rush-api/, "") || "/";

    if (req.method === "GET" && path === "/health") {
      const { count, error } = await supabase
        .from("deploy_rush_scores")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return json({ ok: true, store: "supabase", entries: count ?? 0 });
    }

    if (req.method === "GET" && path === "/leaderboard/global") {
      const limit = clampLimit(url.searchParams.get("limit"));
      const { data, error } = await supabase
        .from("deploy_rush_scores")
        .select(publicColumns)
        .eq("daily", false)
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return json({ mode: "global", entries: (data ?? []).map(toPublicEntry) });
    }

    if (req.method === "GET" && path === "/leaderboard/daily") {
      const seed = Number.parseInt(url.searchParams.get("seed") ?? "", 10);
      if (!Number.isInteger(seed)) return json({ error: "seed (YYYYMMDD integer) is required" }, 400);
      const limit = clampLimit(url.searchParams.get("limit"));
      const { data, error } = await supabase
        .from("deploy_rush_scores")
        .select(publicColumns)
        .eq("daily", true)
        .eq("seed", seed)
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return json({ mode: "daily", seed, entries: (data ?? []).map(toPublicEntry) });
    }

    if (req.method === "POST" && path === "/scores") {
      const body = await req.json().catch(() => null);
      const parsed = validateSubmission(body);
      if (!parsed.ok) return json({ error: parsed.error }, parsed.status);

      const value = parsed.value;
      const { data: inserted, error: insertError } = await supabase
        .from("deploy_rush_scores")
        .insert({
          name: value.name,
          score: value.score,
          duration: value.duration,
          title: value.title,
          badges: value.badges,
          difficulty: value.difficulty,
          daily: value.daily,
          seed: value.seed
        })
        .select(publicColumns)
        .single();

      if (insertError) throw insertError;

      let rankQuery = supabase
        .from("deploy_rush_scores")
        .select("id", { count: "exact", head: true })
        .eq("daily", value.daily);

      if (value.daily) rankQuery = rankQuery.eq("seed", value.seed);
      rankQuery = rankQuery.or(
        `score.gt.${value.score},and(score.eq.${value.score},created_at.lt.${inserted.created_at})`
      );

      const { count: betterCount, error: rankError } = await rankQuery;
      if (rankError) throw rankError;

      let boardQuery = supabase
        .from("deploy_rush_scores")
        .select(publicColumns)
        .eq("daily", value.daily);

      if (value.daily) boardQuery = boardQuery.eq("seed", value.seed);

      const { data: board, error: boardError } = await boardQuery
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(10);

      if (boardError) throw boardError;

      return json({
        rank: (betterCount ?? 0) + 1,
        id: inserted.id,
        entries: (board ?? []).map(toPublicEntry)
      }, 201);
    }

    return json({ error: "not found" }, 404);
  } catch (error) {
    console.error("[deploy-rush-api]", error);
    return json({ error: "internal error" }, 500);
  }
});

const publicColumns = "id,name,score,duration,title,badges,difficulty,daily,seed,created_at";

function toPublicEntry(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    score: row.score,
    duration: row.duration,
    title: row.title,
    badges: Array.isArray(row.badges) ? row.badges : [],
    difficulty: row.difficulty,
    daily: row.daily,
    seed: row.seed,
    date: row.created_at
  };
}

function validateSubmission(body: unknown):
  | { ok: true; value: any }
  | { ok: false; status: number; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail(400, "body must be a JSON object");
  }

  const value = body as Record<string, unknown>;
  const nameCheck = moderateName(value.name);
  if (!nameCheck.ok) return nameCheck;

  const duration = toInt(value.duration);
  if (duration === null || duration < 0 || duration > MAX_DURATION) {
    return fail(400, "duration out of range");
  }

  const score = toInt(value.score);
  if (score === null || score < 0) return fail(400, "score out of range");

  const maxPlausible = MAX_SCORE_PER_SECOND * Math.max(duration, 1) + SCORE_HEADROOM;
  if (score > maxPlausible) {
    return fail(422, "score is implausible for the reported duration");
  }

  const difficulty = typeof value.difficulty === "string" && ALLOWED_DIFFICULTIES.has(value.difficulty)
    ? value.difficulty
    : "conference";

  const rawTitle = typeof value.title === "string" ? value.title : "";
  const title = ALLOWED_TITLES.has(rawTitle) ? rawTitle : "Chaos Engineer";
  const badges = normalizeBadges(value.badges);

  const daily = Boolean(value.daily);
  const seed = toInt(value.seed);
  if (daily && seed === null) return fail(400, "daily submissions require a seed");

  return {
    ok: true,
    value: {
      name: nameCheck.value,
      score,
      duration,
      title,
      badges,
      difficulty,
      daily,
      seed: seed ?? 0
    }
  };
}

function moderateName(raw: unknown):
  | { ok: true; value: string }
  | { ok: false; status: number; error: string } {
  if (typeof raw !== "string") return fail(400, "name is required");

  const cleaned = raw
    .replace(/[^a-zA-Z0-9 _\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LEN);

  if (!cleaned) return fail(400, "name is empty after sanitization");

  const normalized = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (RESERVED_NAMES.has(normalized)) return fail(400, "name is reserved");

  for (const word of BASE_BLOCKLIST) {
    const blocked = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (blocked && normalized.includes(blocked)) return fail(400, "name is not allowed");
  }

  return { ok: true, value: cleaned };
}

function normalizeBadges(raw: unknown) {
  if (!Array.isArray(raw)) return [];

  const badges = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const id = typeof item === "string"
      ? item
      : typeof item === "object" && item !== null && typeof (item as any).id === "string"
        ? (item as any).id
        : "";

    const badge = ALLOWED_BADGES.get(id);
    if (!badge || seen.has(id)) continue;

    seen.add(id);
    badges.push({ id, label: badge[0], description: badge[1] });
    if (badges.length >= 5) break;
  }

  return badges;
}

function clampLimit(raw: string | null) {
  const n = Number.parseInt(raw ?? "10", 10);
  if (!Number.isFinite(n)) return 10;
  return Math.max(1, Math.min(MAX_LIMIT, n));
}

function toInt(value: unknown) {
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isInteger(n) ? n : null;
}

function fail(status: number, error: string) {
  return { ok: false as const, status, error };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}
