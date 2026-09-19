-- Öğrencinin yanlış yüklediği evrakı silebilmesi için DELETE politikaları.
-- Mevcut veritabanında bir kez çalıştırın.

drop policy if exists "documents_delete_own_or_admin" on public.documents;
create policy "documents_delete_own_or_admin"
  on public.documents for delete
  using (
    public.is_admin(auth.uid())
    or exists (select 1 from public.applications a where a.id = application_id and a.student_id = auth.uid())
  );

drop policy if exists "storage_documents_delete_own_or_admin" on storage.objects;
create policy "storage_documents_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (public.is_admin(auth.uid()) or (storage.foldername(name))[1] = auth.uid()::text)
  );
