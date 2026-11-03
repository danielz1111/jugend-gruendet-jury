-- Adjust jury average for four-person teams (A/B/C/D-E at 12.5% each).
-- Five-person teams retain A/B/C/D/E at 10% each.
create or replace function public.jury_team_progress(p_team_id uuid)
returns table(submitted_count bigint,total_jurors bigint,others_average numeric,own_submitted boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_own_submitted boolean;
  v_four boolean;
begin
  if v_user is null or not public.is_juror() then
    raise exception 'Not authorized';
  end if;
  select count(*)=4 into v_four from public.team_members where team_id=p_team_id;
  select exists(
    select 1 from public.evaluations e
    where e.team_id=p_team_id and e.juror_id=v_user and e.submitted_at is not null
  ) into v_own_submitted;
  return query select
    (select count(*) from public.evaluations e where e.team_id=p_team_id and e.submitted_at is not null),
    (select count(*) from public.jury_members),
    case when v_own_submitted then
      (select round(avg(
        case when v_four then
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score)::numeric*0.125
        else
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score+e.expert_e_score)::numeric*0.10
        end
        + e.presentation_impact_score*0.20
        + (e.questions_quality_score+e.questions_confidence_score+e.questions_reasoning_score)*0.10
      ),2)
      from public.evaluations e
      where e.team_id=p_team_id and e.juror_id<>v_user and e.submitted_at is not null)
    else null end,
    v_own_submitted;
end;
$$;
revoke all on function public.jury_team_progress(uuid) from public, anon;
grant execute on function public.jury_team_progress(uuid) to authenticated;
