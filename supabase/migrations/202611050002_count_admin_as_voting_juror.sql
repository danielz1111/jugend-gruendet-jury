-- Count the active project administrator as a regular voting juror while
-- retaining administration rights. Only non-substitute jury accounts are
-- included in official results; the substitute remains excluded.
-- No evaluation rows, roles, scores or session data are changed.

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
  with eligible_jurors as (
    select lower(a.email) as email
    from public.jury_authorized_emails a
    where a.enabled=true and a.is_substitute=false
    union
    select lower(u.email)
    from public.jury_members j
    join auth.users u on u.id=j.user_id
    where j.is_admin=true and u.email is not null
  ),
  scored as (
    select e.juror_id,
      (
        case when v_team_size=4 then
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score)::numeric*0.125
        else
          (e.expert_a_score+e.expert_b_score+e.expert_c_score+e.expert_d_score+e.expert_e_score)::numeric*0.10
        end
        +e.presentation_impact_score::numeric*0.20
        +(e.questions_quality_score+e.questions_confidence_score+e.questions_reasoning_score)::numeric*0.10
      ) as points
    from public.evaluations e
    join auth.users u on u.id=e.juror_id
    join eligible_jurors j on j.email=lower(u.email)
    where e.team_id=p_team_id
      and e.submitted_at is not null
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
    select
      count(*)::bigint as completed,
      coalesce(bool_or(s.juror_id=v_user),false) as user_submitted,
      round(avg(s.points),2) as jury_average,
      round(avg(s.points) filter(where s.juror_id<>v_user),2) as peers_average
    from scored s
  )
  select
    s.completed,
    (select count(*)::bigint from eligible_jurors),
    case
      when v_is_admin then s.jury_average
      when s.user_submitted then s.peers_average
      else null::numeric
    end,
    s.user_submitted
  from summary s;
end;
$function$;

revoke all on function public.jury_team_progress(uuid) from public, anon;
grant execute on function public.jury_team_progress(uuid) to authenticated;
