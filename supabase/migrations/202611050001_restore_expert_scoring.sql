-- Restore the original pitch-only jury assessment: five expert areas A-E
-- (10% each), or four areas A/B/C/D-E (12.5% each), plus 20% live
-- presentation impact and three jury-question ratings (10% each).
-- This migration changes the aggregate RPC only; it never updates or
-- deletes any existing team, evaluation or note.
-- Keep the existing function signature and permissions.
create or replace function public.jury_team_progress(p_team_id uuid)
returns table(submitted_count bigint,total_jurors bigint,others_average numeric,own_submitted boolean)
language plpgsql stable security definer set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_is_admin boolean;
  v_team_size integer;
begin
  if v_user is null or not public.is_juror() then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  v_is_admin := public.is_admin();
  select count(*)::integer into v_team_size
  from public.team_members where team_id=p_team_id;
  if v_team_size not in (4,5) then
    raise exception 'Team size must be four or five' using errcode='22023';
  end if;

  return query
  with valid_evaluations as (
    select e.*
    from public.evaluations e
    join public.jury_members j on j.user_id=e.juror_id
    where e.team_id=p_team_id
      and e.submitted_at is not null
      and j.is_admin=false
      and e.expert_a_score between 1 and 10
      and e.expert_b_score between 1 and 10
      and e.expert_c_score between 1 and 10
      and e.expert_d_score between 1 and 10
      and (v_team_size=4 or e.expert_e_score between 1 and 10)
      and e.presentation_impact_score between 1 and 10
      and e.questions_quality_score between 1 and 10
      and e.questions_confidence_score between 1 and 10
      and e.questions_reasoning_score between 1 and 10
  ),
  summary as (
    select count(*)::bigint as completed,
      coalesce(bool_or(e.juror_id=v_user),false) as own_completed,
      round(avg(
        case when v_team_size=4 then
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score)::numeric*0.125
        else
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score+e.expert_e_score)::numeric*0.10
        end
        + e.presentation_impact_score::numeric*0.20
        + (e.questions_quality_score+e.questions_confidence_score+e.questions_reasoning_score)::numeric*0.10
      ) filter(where e.juror_id<>v_user),2) as peer_average
    from valid_evaluations e
  )
  select s.completed,
    (select count(*)::bigint from public.jury_authorized_emails a
      where a.enabled=true and a.is_substitute=false),
    case when v_is_admin or s.own_completed then s.peer_average else null::numeric end,
    s.own_completed
  from summary s;
end;
$function$;
revoke all on function public.jury_team_progress(uuid) from public, anon;
grant execute on function public.jury_team_progress(uuid) to authenticated;
