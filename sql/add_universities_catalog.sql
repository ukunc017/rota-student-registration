-- Mevcut bir veritabanına üniversite/program kataloğunu ekler.
-- sql/schema.sql zaten bu tabloları içeriyorsa bu dosyayı atlayın.

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text,
  kind text not null default 'public' check (kind in ('public', 'private')),
  founded_year int,
  website text,
  instruction_languages text,
  student_count text,
  tuition_range text,
  housing text,
  about text,
  admission_requirements text,
  city_life text,
  rota_note text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.universities enable row level security;

drop policy if exists "universities_select_active_or_admin" on public.universities;
create policy "universities_select_active_or_admin"
  on public.universities for select
  using (active or public.is_admin(auth.uid()));

drop policy if exists "universities_write_admin_only" on public.universities;
create policy "universities_write_admin_only"
  on public.universities for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  faculty text,
  degree text not null default 'bachelor' check (degree in ('bachelor', 'master', 'phd')),
  language text,
  duration_years numeric,
  tuition_note text,
  description text,
  entry_requirements text,
  career_note text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.programs enable row level security;

drop policy if exists "programs_select_active_or_admin" on public.programs;
create policy "programs_select_active_or_admin"
  on public.programs for select
  using (active or public.is_admin(auth.uid()));

drop policy if exists "programs_write_admin_only" on public.programs;
create policy "programs_write_admin_only"
  on public.programs for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

alter table public.applications
  add column if not exists university_id uuid references public.universities(id) on delete set null,
  add column if not exists program_id uuid references public.programs(id) on delete set null;

grant select on public.universities to anon, authenticated;
grant select on public.programs to anon, authenticated;
grant insert, update, delete on public.universities to authenticated;
grant insert, update, delete on public.programs to authenticated;
