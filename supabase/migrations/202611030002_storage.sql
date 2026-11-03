-- Create the buckets. This migration does NOT grant public upload rights.
-- Official static Landheim photos remain in /public/images and deploy with Vercel.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('team-public','team-public',true,10485760),
  ('team-private','team-private',false,52428800),
  ('jury-private','jury-private',false,52428800)
on conflict (id) do nothing;
-- Public images are readable by anyone, but only admin may upload or edit.
create policy "Read approved public team assets" on storage.objects
for select to anon, authenticated using (bucket_id = 'team-public');
create policy "Admin uploads team assets" on storage.objects
for insert to authenticated with check (
 bucket_id in ('team-public','team-private','jury-private') and (select public.is_admin())
);
create policy "Admin updates team assets" on storage.objects
for update to authenticated using (
 bucket_id in ('team-public','team-private','jury-private') and (select public.is_admin())
) with check (
 bucket_id in ('team-public','team-private','jury-private') and (select public.is_admin())
);
create policy "Admin deletes team assets" on storage.objects
for delete to authenticated using (
 bucket_id in ('team-public','team-private','jury-private') and (select public.is_admin())
);
create policy "Jurors read private team assets" on storage.objects
for select to authenticated using (
 bucket_id in ('team-private','jury-private') and (select public.is_juror())
);
-- Important: A public bucket makes every object in it publicly readable.
-- Only upload approved content to team-public. For minors, verify photo consent first.
