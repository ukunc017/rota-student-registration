-- Öğrenci/admin silinirken profiles satırına bağlı FK'ler engellemesin.
-- Supabase SQL Editor'de bir kez çalıştırın.

alter table public.status_history
  drop constraint if exists status_history_changed_by_fkey;
alter table public.status_history
  add constraint status_history_changed_by_fkey
  foreign key (changed_by) references public.profiles(id) on delete set null;

alter table public.documents
  drop constraint if exists documents_reviewed_by_fkey;
alter table public.documents
  add constraint documents_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.notification_log
  drop constraint if exists notification_log_created_by_fkey;
alter table public.notification_log
  add constraint notification_log_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;
