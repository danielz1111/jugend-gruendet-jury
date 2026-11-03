-- Team photos and student names are exclusively for authenticated jurors.
-- Remove the earlier public-consent exception; public website never exposes pupils.
begin;
drop policy if exists "Members visible to jury or approved public" on public.team_members;
create policy "Members visible only to jury"
on public.team_members for select to authenticated
using ((select public.is_juror()));
alter table public.teams add column if not exists jury_photo_path text;
-- Team photos belong only in the PRIVATE team-private storage bucket.
-- No public storage URL should be used for jury_photo_path.
commit;
