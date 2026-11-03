-- Apply in Supabase SQL Editor before enabling the revised jury interface.
-- A-E: 10% each; presentation: 20%; jury questions: 10% each.
alter table public.evaluations
  add column if not exists expert_a_score integer check (expert_a_score between 1 and 10),
  add column if not exists expert_b_score integer check (expert_b_score between 1 and 10),
  add column if not exists expert_c_score integer check (expert_c_score between 1 and 10),
  add column if not exists expert_d_score integer check (expert_d_score between 1 and 10),
  add column if not exists expert_e_score integer check (expert_e_score between 1 and 10),
  add column if not exists presentation_impact_score integer check (presentation_impact_score between 1 and 10),
  add column if not exists questions_quality_score integer check (questions_quality_score between 1 and 10),
  add column if not exists questions_confidence_score integer check (questions_confidence_score between 1 and 10),
  add column if not exists questions_reasoning_score integer check (questions_reasoning_score between 1 and 10),
  add column if not exists submitted_at timestamptz;

-- Return aggregate values only. Never expose other jurors' individual evaluations.
create or replace function public.jury_team_progress(p_team_id uuid)
returns table(submitted_count bigint,total_jurors bigint,others_average numeric,own_submitted boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_own_submitted boolean;
begin
  if v_user is null or not public.is_juror() then
    raise exception 'Not authorized';
  end if;
  select exists(
    select 1 from public.evaluations e
    where e.team_id = p_team_id and e.juror_id = v_user and e.submitted_at is not null
  ) into v_own_submitted;
  return query
  select
    (select count(*) from public.evaluations e where e.team_id = p_team_id and e.submitted_at is not null),
    (select count(*) from public.jury_members),
    case when v_own_submitted then
      (select round(avg((
        e.expert_a_score + e.expert_b_score + e.expert_c_score +
        e.expert_d_score + e.expert_e_score +
        2 * e.presentation_impact_score +
        e.questions_quality_score + e.questions_confidence_score + e.questions_reasoning_score
      )::numeric / 10),2)
      from public.evaluations e
      where e.team_id = p_team_id and e.juror_id <> v_user and e.submitted_at is not null)
    else null end,
    v_own_submitted;
end;
$$;
revoke all on function public.jury_team_progress(uuid) from public, anon;
grant execute on function public.jury_team_progress(uuid) to authenticated;
