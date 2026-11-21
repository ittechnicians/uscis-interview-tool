-- Modo maestro: avance de las clases por grupo. Ejecutar UNA vez en Supabase > SQL Editor.
create table if not exists public.course_progress (
  cohort      text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
-- Solo el servidor (service role) lee y escribe. Sin políticas = cerrado para el navegador.
alter table public.course_progress enable row level security;
