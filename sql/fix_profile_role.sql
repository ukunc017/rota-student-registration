-- Güvenlik düzeltmesi: öğrencilerin kendi kendine admin rolü vermesini engeller.
-- sql/schema.sql zaten çalıştırıldıysa, sadece bu dosyayı ek olarak çalıştırın.
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
