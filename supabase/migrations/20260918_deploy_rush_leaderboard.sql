-- Deploy Rush leaderboard schema and public RPC API.
-- The table itself is not accessible to anon/authenticated roles; callers only
-- get the explicitly granted security-definer functions below.

create extension if not exists pgcrypto;

create table if not exists public.deploy_rush_scores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 12),
  score integer not null check (score >= 0),
  duration integer not null check (duration between 0 and 600),
  title text not null,
  badges jsonb not null default '[]'::jsonb check (jsonb_typeof(badges) = 'array'),
  difficulty text not null check (difficulty in ('normal', 'hard', 'conference')),
  daily boolean not null default false,
  seed integer not null default 0,
  created_at timestamptz not null default now(),
  ip_hash text
);

create index if not exists deploy_rush_scores_global_idx
  on public.deploy_rush_scores (daily, score desc, created_at asc);

create index if not exists deploy_rush_scores_daily_idx
  on public.deploy_rush_scores (daily, seed, score desc, created_at asc);

alter table public.deploy_rush_scores enable row level security;
revoke all on table public.deploy_rush_scores from anon, authenticated;

create or replace function public.deploy_rush_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.deploy_rush_scores;
$$;

create or replace function public.deploy_rush_leaderboard_global(p_limit integer default 10)
returns table (
  id uuid,
  name text,
  score integer,
  duration integer,
  title text,
  badges jsonb,
  difficulty text,
  daily boolean,
  seed integer,
  date timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id, s.name, s.score, s.duration, s.title, s.badges,
    s.difficulty, s.daily, s.seed, s.created_at as date
  from public.deploy_rush_scores s
  where s.daily = false
  order by s.score desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

create or replace function public.deploy_rush_leaderboard_daily(
  p_seed integer,
  p_limit integer default 10
)
returns table (
  id uuid,
  name text,
  score integer,
  duration integer,
  title text,
  badges jsonb,
  difficulty text,
  daily boolean,
  seed integer,
  date timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id, s.name, s.score, s.duration, s.title, s.badges,
    s.difficulty, s.daily, s.seed, s.created_at as date
  from public.deploy_rush_scores s
  where s.daily = true and s.seed = p_seed
  order by s.score desc, s.created_at asc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

create or replace function public.deploy_rush_submit_score(
  p_name text,
  p_score integer,
  p_duration integer,
  p_title text,
  p_badges jsonb,
  p_difficulty text,
  p_daily boolean,
  p_seed integer,
  p_ip_hash text default null
)
returns table (
  id uuid,
  rank bigint,
  date timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_date timestamptz;
  v_rank bigint;
begin
  if p_name is null or char_length(p_name) < 1 or char_length(p_name) > 12 then
    raise exception 'invalid name';
  end if;
  if p_score is null or p_score < 0 then
    raise exception 'invalid score';
  end if;
  if p_duration is null or p_duration < 0 or p_duration > 600 then
    raise exception 'invalid duration';
  end if;
  if p_score > (700 * greatest(p_duration, 1) + 3000) then
    raise exception 'implausible score';
  end if;
  if p_difficulty not in ('normal', 'hard', 'conference') then
    raise exception 'invalid difficulty';
  end if;
  if jsonb_typeof(coalesce(p_badges, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid badges';
  end if;

  insert into public.deploy_rush_scores (
    name, score, duration, title, badges, difficulty, daily, seed, ip_hash
  ) values (
    p_name,
    p_score,
    p_duration,
    p_title,
    coalesce(p_badges, '[]'::jsonb),
    p_difficulty,
    coalesce(p_daily, false),
    coalesce(p_seed, 0),
    p_ip_hash
  )
  returning deploy_rush_scores.id, deploy_rush_scores.created_at into v_id, v_date;

  if coalesce(p_daily, false) then
    select count(*) + 1 into v_rank
    from public.deploy_rush_scores s
    where s.daily = true
      and s.seed = coalesce(p_seed, 0)
      and (
        s.score > p_score
        or (s.score = p_score and s.created_at < v_date)
      );
  else
    select count(*) + 1 into v_rank
    from public.deploy_rush_scores s
    where s.daily = false
      and (
        s.score > p_score
        or (s.score = p_score and s.created_at < v_date)
      );
  end if;

  return query select v_id, v_rank, v_date;
end;
$$;

revoke all on function public.deploy_rush_count() from public;
revoke all on function public.deploy_rush_leaderboard_global(integer) from public;
revoke all on function public.deploy_rush_leaderboard_daily(integer, integer) from public;
revoke all on function public.deploy_rush_submit_score(text, integer, integer, text, jsonb, text, boolean, integer, text) from public;

grant execute on function public.deploy_rush_count() to anon, authenticated;
grant execute on function public.deploy_rush_leaderboard_global(integer) to anon, authenticated;
grant execute on function public.deploy_rush_leaderboard_daily(integer, integer) to anon, authenticated;
grant execute on function public.deploy_rush_submit_score(text, integer, integer, text, jsonb, text, boolean, integer, text) to anon, authenticated;
