-- Reviewed team names from user-provided Jugend-gruendet screenshots.
-- Replaces only the explicitly marked demonstration team.
-- Student membership is deliberately NOT public; add after private jury access is tested.
begin;
delete from public.teams where name = 'DEMO – Testunternehmen' and position = 9;
insert into public.teams (name, position, is_public) values ('Slimpower', 1, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('AkkuWakku', 2, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Clickwatch', 3, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('NEXORA-Security', 4, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Paste-In', 5, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Musickares', 6, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Fridge Buddy', 7, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Pack & Zack', 8, true) on conflict (position) do update set name = excluded.name, is_public = true;
insert into public.teams (name, position, is_public) values ('Alpinex', 9, true) on conflict (position) do update set name = excluded.name, is_public = true;
commit;
