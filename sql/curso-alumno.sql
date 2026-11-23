-- Curso a tu ritmo: avance de cada alumno (y del juego) guardado en su cuenta.
-- Ejecutar UNA vez en Supabase > SQL Editor.
create table if not exists public.student_progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  course      jsonb not null default '{}'::jsonb,   -- avance del curso a tu ritmo
  game        jsonb not null default '{}'::jsonb,   -- estrellas, XP y niveles del juego
  updated_at  timestamptz not null default now()
);
alter table public.student_progress enable row level security;

-- Cada alumno solo ve y cambia SU fila.
drop policy if exists "own progress read"   on public.student_progress;
drop policy if exists "own progress insert" on public.student_progress;
drop policy if exists "own progress update" on public.student_progress;
create policy "own progress read"   on public.student_progress for select using (auth.uid() = user_id);
create policy "own progress insert" on public.student_progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.student_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
