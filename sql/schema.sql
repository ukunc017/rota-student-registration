-- Rota Education Consultancy — Öğrenci Kayıt Sistemi
-- Supabase Dashboard > SQL Editor içinde tek seferde çalıştırın.
-- Sıra önemlidir (tablolar, sonra fonksiyon/trigger'lar, sonra storage).

-- =========================================================================
-- 1) profiles — her auth.users satırına karşılık gelen rol/iletişim bilgisi
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text,
  email text,
  phone text,
  nationality text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS politikaları rol kontrolü için birbirine referans verdiğinden (profiles
-- <-> applications <-> documents), sonsuz döngüyü önlemek için is_admin()
-- SECURITY DEFINER olarak tanımlanır (RLS'yi bypass ederek tek satır okur).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));

-- ÖNEMLİ: Öğrenci kendi profilini güncelleyebildiği için (yukarıdaki politika),
-- bu trigger olmadan herhangi bir öğrenci kendi role'ünü 'admin' yapabilirdi.
-- auth.uid() IS NULL kontrolü SQL Editor / service_role üzerinden yapılan
-- (JWT'siz) bootstrap işlemlerine izin verir; JWT ile gelen isteklerde ise
-- yalnızca zaten admin olan biri role değiştirebilir.
create or replace function public.enforce_profile_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin(auth.uid()) then
    return new;
  end if;
  new.role := old.role;
  return new;
end;
$$;

create trigger trg_enforce_profile_write
  before update on public.profiles
  for each row execute function public.enforce_profile_write();

-- =========================================================================
-- 2) applications — her öğrencinin tek başvurusu ve süreç durumu
-- =========================================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pre_registration'
    check (status in ('pre_registration', 'documents_pending', 'under_review', 'accepted', 'completed')),
  target_program text,
  target_university text,
  notes text,
  acceptance_letter_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index applications_one_per_student on public.applications(student_id);

alter table public.applications enable row level security;

create policy "applications_select_own_or_admin"
  on public.applications for select
  using (student_id = auth.uid() or public.is_admin(auth.uid()));

create policy "applications_insert_own_or_admin"
  on public.applications for insert
  with check (student_id = auth.uid() or public.is_admin(auth.uid()));

create policy "applications_update_own_or_admin"
  on public.applications for update
  using (student_id = auth.uid() or public.is_admin(auth.uid()))
  with check (student_id = auth.uid() or public.is_admin(auth.uid()));

-- Öğrenci kendi başvurusunu güncelleyebilir ama sadece pre_registration <->
-- documents_pending arasında geçebilir; kabul mektubu ve iç notlar sadece
-- admin tarafından değiştirilebilir. Admin her zaman serbesttir.
create or replace function public.enforce_application_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  new.acceptance_letter_path := old.acceptance_letter_path;
  new.notes := old.notes;
  if new.status not in ('pre_registration', 'documents_pending') then
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_application_write
  before update on public.applications
  for each row execute function public.enforce_application_write();

-- Durum değişikliklerinin otomatik denetim izi
create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

alter table public.status_history enable row level security;

create policy "status_history_select_own_or_admin"
  on public.status_history for select
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.applications a
      where a.id = application_id and a.student_id = auth.uid()
    )
  );

create or replace function public.log_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.status_history (application_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- trg_enforce_application_write önce (alfabetik sırayla) çalışıp NEW'i
-- düzeltir, bu trigger düzeltilmiş son durumu loglar.
create trigger trg_log_application_status_change
  before update on public.applications
  for each row execute function public.log_application_status_change();

-- =========================================================================
-- 3) document_types — admin panelinden yönetilebilen evrak türü listesi
-- =========================================================================
create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label_tr text not null,
  label_en text not null,
  required boolean not null default true,
  active boolean not null default true,
  sort_order int not null default 0
);

alter table public.document_types enable row level security;

create policy "document_types_select_active_or_admin"
  on public.document_types for select
  using (active or public.is_admin(auth.uid()));

create policy "document_types_write_admin_only"
  on public.document_types for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.document_types (key, label_tr, label_en, required, sort_order) values
  ('passport', 'Pasaport', 'Passport', true, 1),
  ('diploma_transcript', 'Diploma / Transkript', 'Diploma / Transcript', true, 2),
  ('photo', 'Vesikalık Fotoğraf', 'Photo', true, 3),
  ('language_certificate', 'Dil Sertifikası', 'Language Certificate', false, 4);

-- =========================================================================
-- 4) documents — öğrencinin her evrak türü için yüklediği dosya + durumu
-- =========================================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_type_id uuid not null references public.document_types(id),
  storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  unique (application_id, document_type_id)
);

alter table public.documents enable row level security;

create policy "documents_select_own_or_admin"
  on public.documents for select
  using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())
  );

create policy "documents_insert_own_or_admin"
  on public.documents for insert
  with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())
  );

create policy "documents_update_own_or_admin"
  on public.documents for update
  using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())
  )
  with check (
    public.is_admin(auth.uid())
    or exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())
  );

-- Öğrenci evrakını yeniden yükleyebilir ama kendi kendine onaylayamaz/reddedemez;
-- inceleme alanları (status/review_note/reviewed_*) sadece admin tarafından
-- yazılabilir. Admin ne yazarsa aynen geçer, ayrıca reviewed_by/reviewed_at otomatik doldurulur.
create or replace function public.enforce_document_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.status := 'pending';
    new.review_note := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

create trigger trg_enforce_document_insert
  before insert on public.documents
  for each row execute function public.enforce_document_insert();

create or replace function public.enforce_document_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    new.reviewed_by := auth.uid();
    if new.status is distinct from old.status then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  new.status := 'pending';
  new.review_note := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.uploaded_at := now();
  return new;
end;
$$;

create trigger trg_enforce_document_update
  before update on public.documents
  for each row execute function public.enforce_document_update();

-- =========================================================================
-- 5) Storage: özel (private) "documents" bucket'ı, öğrenci_id klasörlemesi
--    Dosya yolu biçimi: <student_id>/<belge-adı>
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "storage_documents_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (public.is_admin(auth.uid()) or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "storage_documents_insert_own_or_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (public.is_admin(auth.uid()) or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "storage_documents_update_own_or_admin"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and (public.is_admin(auth.uid()) or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- =========================================================================
-- 6) İlk admin hesabı
-- =========================================================================
-- 1. Önce normal öğrenci kayıt formundan (index.html) kendi e-postanızla
--    BİR kez kaydolun (örn. admin@rota.com).
-- 2. Ardından aşağıdaki satırı KENDİ e-postanızla değiştirip çalıştırın:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'admin@rota.com');
