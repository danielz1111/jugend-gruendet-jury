-- Initial schema. Apply only after reviewing against the intended Supabase project.
create extension if not exists pgcrypto;
create table public.teams (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 tagline text,
 description text,
 logo_path text,
 cover_path text,
 position integer not null unique check(position between 1 and 9),
 is_public boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.team_members (
 id uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.teams(id) on delete cascade,
 display_name text not null,
 expert_role text,
 photo_path text,
 display_order integer not null default 0,
 public_consent boolean not null default false
);
create table public.jury_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null,
 is_admin boolean not null default false
);
create table public.team_materials (
 id uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.teams(id) on delete cascade,
 title text not null,
 object_path text not null,
 media_type text,
 original_filename text,
 created_at timestamptz not null default now()
);
create table public.evaluations (
 id uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.teams(id) on delete cascade,
 juror_id uuid not null references auth.users(id) on delete cascade,
 presentation_score integer check(presentation_score between 1 and 5),
 questions_score integer check(questions_score between 1 and 5),
 updated_at timestamptz not null default now(),
 unique(team_id,juror_id)
);
create table public.jury_notes (
 id uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.teams(id) on delete cascade,
 member_id uuid references public.team_members(id) on delete set null,
 juror_id uuid not null references auth.users(id) on delete cascade,
 content text not null default '',
 updated_at timestamptz not null default now()
);
create table public.event_state (
 singleton boolean primary key default true check(singleton),
 active_team_id uuid references public.teams(id) on delete set null,
 updated_at timestamptz not null default now()
);
insert into public.event_state(singleton) values(true);
create index on public.team_members(team_id);
create index on public.team_materials(team_id);
create index on public.evaluations(juror_id);
create index on public.jury_notes(juror_id,team_id);
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.jury_members enable row level security;
alter table public.team_materials enable row level security;
alter table public.evaluations enable row level security;
alter table public.jury_notes enable row level security;
alter table public.event_state enable row level security;
create function public.is_juror() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.jury_members j where j.user_id=(select auth.uid()))$$;
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.jury_members j where j.user_id=(select auth.uid()) and j.is_admin)$$;
revoke all on function public.is_juror() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_juror() to authenticated;
grant execute on function public.is_admin() to authenticated;
create policy "Public approved or jury teams" on public.teams for select to anon,authenticated using(is_public or (select public.is_juror()));
create policy "Admin teams" on public.teams for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "Members visible to jury or approved public" on public.team_members for select to anon,authenticated using((select public.is_juror()) or (public_consent and exists(select 1 from public.teams t where t.id=team_id and t.is_public)));
create policy "Admin members" on public.team_members for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "Jury sees materials" on public.team_materials for select to authenticated using((select public.is_juror()));
create policy "Admin materials" on public.team_materials for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "Juror sees own profile" on public.jury_members for select to authenticated using(user_id=(select auth.uid()) or (select public.is_admin()));
create policy "Juror sees own scores" on public.evaluations for select to authenticated using(juror_id=(select auth.uid()));
create policy "Juror inserts own scores" on public.evaluations for insert to authenticated with check(juror_id=(select auth.uid()) and (select public.is_juror()));
create policy "Juror updates own scores" on public.evaluations for update to authenticated using(juror_id=(select auth.uid())) with check(juror_id=(select auth.uid()));
create policy "Juror sees own notes" on public.jury_notes for select to authenticated using(juror_id=(select auth.uid()));
create policy "Juror creates own notes" on public.jury_notes for insert to authenticated with check(juror_id=(select auth.uid()) and (select public.is_juror()));
create policy "Juror edits own notes" on public.jury_notes for update to authenticated using(juror_id=(select auth.uid())) with check(juror_id=(select auth.uid()));
create policy "Juror deletes own notes" on public.jury_notes for delete to authenticated using(juror_id=(select auth.uid()));
create policy "Jury sees event state" on public.event_state for select to authenticated using((select public.is_juror()));
create policy "Admin controls event" on public.event_state for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
-- Create private storage buckets through Supabase dashboard; add explicit storage.objects policies before uploading.
