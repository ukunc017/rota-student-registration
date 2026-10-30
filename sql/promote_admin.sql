-- Ek admin hesabı (SQL Editor).
-- 1) Kişi normal kayıt formundan kaydolsun.
-- 2) Aşağıdaki e-postayı değiştirip çalıştırın.
-- Birden fazla admin olabilir; satırı her yeni admin için tekrarlayın.

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'yeni.admin@ornek.com'
);
