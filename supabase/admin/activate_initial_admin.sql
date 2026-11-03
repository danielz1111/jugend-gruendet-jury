-- Initial jury administrator. Run manually in the intended Supabase project.
-- Replace the email below if a different school account was created.
-- This does not grant Supabase project-owner privileges.
do $$
begin
  if not exists (select 1 from auth.users where lower(email) = lower('dzech@landheim-ammersee.de')) then
    raise exception 'School account not found in auth.users; check the email before proceeding';
  end if;
end $$;
insert into public.jury_members (user_id, display_name, is_admin)
select id, 'D. Zech', true
from auth.users
where lower(email) = lower('dzech@landheim-ammersee.de')
on conflict (user_id) do update
set display_name = excluded.display_name, is_admin = true;
-- Verify: one row with is_admin=true
select j.display_name, j.is_admin, u.email
from public.jury_members j join auth.users u on u.id = j.user_id
where lower(u.email) = lower('dzech@landheim-ammersee.de');
