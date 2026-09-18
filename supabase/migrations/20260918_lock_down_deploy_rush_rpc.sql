revoke execute on function public.deploy_rush_count() from anon, authenticated;
revoke execute on function public.deploy_rush_leaderboard_global(integer) from anon, authenticated;
revoke execute on function public.deploy_rush_leaderboard_daily(integer, integer) from anon, authenticated;
revoke execute on function public.deploy_rush_submit_score(
  text, integer, integer, text, jsonb, text, boolean, integer, text
) from anon, authenticated;
