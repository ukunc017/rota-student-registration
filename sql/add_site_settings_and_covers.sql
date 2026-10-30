-- İletişim ayarları (admin panelinden) + üniversite kapak görseli.
-- Supabase SQL Editor'de bir kez çalıştırın.

-- =========================================================================
-- 1) site_settings — tek satırlık iletişim / sosyal ayarlar
-- =========================================================================
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company text,
  email text,
  phone text,
  address text,
  hours text,
  about text,
  social jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_all" on public.site_settings;
create policy "site_settings_select_all"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_write_admin" on public.site_settings;
create policy "site_settings_write_admin"
  on public.site_settings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

insert into public.site_settings (id, company, email, phone, address, hours, about, social)
values (
  1,
  'RotaEdu Turkey',
  'info@rotaedu.turkey',
  '+90 XXX XXX XX XX',
  'İstanbul, Türkiye',
  'Pzt–Cum 09:00–18:00',
  null,
  '{"instagram":"https://www.instagram.com/rotaeduturkey/","facebook":"","twitter":"","linkedin":""}'::jsonb
)
on conflict (id) do nothing;

-- =========================================================================
-- 2) universities.cover_path
-- =========================================================================
alter table public.universities
  add column if not exists cover_path text;

-- =========================================================================
-- 3) Storage: herkese açık kapak görselleri
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

drop policy if exists "public_media_select" on storage.objects;
create policy "public_media_select"
  on storage.objects for select
  using (bucket_id = 'public-media');

drop policy if exists "public_media_insert_admin" on storage.objects;
create policy "public_media_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'public-media' and public.is_admin(auth.uid()));

drop policy if exists "public_media_update_admin" on storage.objects;
create policy "public_media_update_admin"
  on storage.objects for update
  using (bucket_id = 'public-media' and public.is_admin(auth.uid()));

drop policy if exists "public_media_delete_admin" on storage.objects;
create policy "public_media_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'public-media' and public.is_admin(auth.uid()));
