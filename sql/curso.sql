-- Curso en vivo: tablas para inscripciones y lista de espera.
-- Ejecutar UNA vez en Supabase > SQL Editor.

create table if not exists public.course_enrollments (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  cohort          text not null,
  amount_cents    integer,
  stripe_session  text unique,
  created_at      timestamptz not null default now()
);
create index if not exists course_enrollments_cohort_idx on public.course_enrollments (cohort);

create table if not exists public.course_waitlist (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  phone       text,
  schedule    text not null check (schedule in ('sabado','noche')),
  cohort      text,
  created_at  timestamptz not null default now()
);

-- Seguridad: solo el servidor (service role) escribe. Cada alumno puede ver SU inscripción.
alter table public.course_enrollments enable row level security;
alter table public.course_waitlist   enable row level security;

drop policy if exists "own enrollment" on public.course_enrollments;
create policy "own enrollment" on public.course_enrollments
  for select using (auth.uid() = user_id);
