-- Share only submission status (no scores) with authenticated jurors.
-- Regular jurors plus the administrator count; substitutes are excluded.
-- An unregistered invited juror remains visible as "Noch offen".
create or replace function public.jury_team_submission_status(p_team_id uuid)
returns table(display_name text, submitted boolean, is_current_user boolean)
language plpgsql stable security definer set search_path = ''
as $function$
declare
 v_user uuid := auth.uid();
 v_team_size integer;
begin
 if v_user is null or not public.is_juror() then
   raise exception 'Not authorized' using errcode='42501';
 end if;
 select count(*)::integer into v_team_size
 from public.team_members where team_id=p_team_id;
 if v_team_size not in (4,5) then
   raise exception 'Team size must be four or five' using errcode='22023';
 end if;

 return query
 with eligible as (
   select a.display_name as person_name, u.id as user_id, false as admin_member
   from public.jury_authorized_emails a
   left join auth.users u on lower(u.email)=lower(a.email)
   where a.enabled=true and a.is_substitute=false
   union all
   select j.display_name as person_name, u.id as user_id, true as admin_member
   from public.jury_members j
   join auth.users u on u.id=j.user_id
   where j.is_admin=true
     and not exists(
       select 1 from public.jury_authorized_emails a
       where a.enabled=true and a.is_substitute=false
         and lower(a.email)=lower(u.email)
     )
 )
 select coalesce(nullif(trim(e.person_name),''),'Jurymitglied')::text,
   exists(
     select 1 from public.evaluations v
     where v.team_id=p_team_id
       and v.juror_id=e.user_id
       and v.submitted_at is not null
       and v.expert_a_score between 1 and 10
       and v.expert_b_score between 1 and 10
       and v.expert_c_score between 1 and 10
       and v.expert_d_score between 1 and 10
       and (v_team_size=4 or v.expert_e_score between 1 and 10)
       and v.presentation_impact_score between 1 and 10
       and v.questions_quality_score between 1 and 10
       and v.questions_confidence_score between 1 and 10
       and v.questions_reasoning_score between 1 and 10
   ) as submitted,
   (e.user_id=v_user) as is_current_user
 from eligible e
 order by e.admin_member, e.person_name;
end;
$function$;
revoke all on function public.jury_team_submission_status(uuid) from public, anon;
grant execute on function public.jury_team_submission_status(uuid) to authenticated;
