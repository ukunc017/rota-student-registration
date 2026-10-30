-- Öğrenci e-posta bildirimleri için log tablosu.
-- Supabase Dashboard > SQL Editor'de bir kez çalıştırın.
-- Edge Function: supabase/functions/notify-student

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in (
    'document_approved',
    'document_rejected',
    'status_changed',
    'acceptance_letter',
    'documents_reminder'
  )),
  payload jsonb not null default '{}'::jsonb,
  email_to text,
  sent_at timestamptz,
  error text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_app_kind_created
  on public.notification_log (application_id, kind, created_at desc);

alter table public.notification_log enable row level security;

drop policy if exists "notification_log_select_own_or_admin" on public.notification_log;
create policy "notification_log_select_own_or_admin"
  on public.notification_log for select
  using (student_id = auth.uid() or public.is_admin(auth.uid()));

-- Yazma yalnızca service_role / Edge Function (SECURITY DEFINER yok;
-- client doğrudan insert etmez).

grant select on public.notification_log to authenticated;
