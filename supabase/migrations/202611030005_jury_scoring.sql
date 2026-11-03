-- Run once in Supabase SQL Editor before using the new jury scoring UI.
alter table public.evaluations
  add column if not exists idea_score integer check (idea_score between 1 and 10),
  add column if not exists economics_score integer check (economics_score between 1 and 10),
  add column if not exists pitch_score integer check (pitch_score between 1 and 10),
  add column if not exists answers_score integer check (answers_score between 1 and 10),
  add column if not exists team_score integer check (team_score between 1 and 10);
-- The old 1–5 columns remain for backward compatibility but are not used by the new UI.
