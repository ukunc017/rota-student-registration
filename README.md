# Rota Education Consultancy — Öğrenci Kayıt Sistemi

Yurt dışından öğrencilerin ön kayıt yapıp evraklarını yüklediği, danışmanlığın
tüm süreci (ön kayıt → evrak yükleme → inceleme → kabul mektubu → kayıt
tamamlandı) tek bir panelden takip ettiği web uygulaması.

Vanilla HTML/CSS/JS + [Supabase](https://supabase.com) (Postgres + Auth +
Storage) ile yazıldı, framework/build adımı yok.

## Kurulum

1. **Supabase projesi oluşturun:** [supabase.com](https://supabase.com) üzerinde
   ücretsiz bir proje açın.
2. **Şemayı çalıştırın:** Supabase Dashboard > SQL Editor'de
   [`sql/schema.sql`](sql/schema.sql) dosyasının tamamını yapıştırıp çalıştırın.
   Bu, tabloları, RLS politikalarını, `documents` storage bucket'ını ve
   varsayılan 4 evrak türünü oluşturur.
3. **API bilgilerinizi girin:** `js/config.example.js` dosyasını `js/config.js`
   olarak kopyalayın, Supabase Dashboard > Project Settings > API sayfasından
   aldığınız `Project URL` ve `anon public` anahtarını girin.
   ```bash
   cp js/config.example.js js/config.js
   ```
   `js/config.js` `.gitignore`'dadır, commit'lenmez.
4. **Siteyi çalıştırın:**
   ```bash
   npm install
   npm start
   ```
   veya Vercel CLI ile: `npm run dev`
5. **İlk admin hesabını oluşturun:** `index.html` üzerinden normal bir öğrenci
   gibi kaydolun, sonra Supabase SQL Editor'de kendi e-postanızla:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'sizin@eposta.com');
   ```
   çalıştırın. O hesapla giriş yaptığınızda otomatik olarak `admin.html`'e
   yönlendirilirsiniz.

## Yapı

- `index.html` — öğrenci/admin giriş ve kayıt sayfası
- `student.html` + `js/student.js` — öğrenci paneli: başvuru formu, evrak
  yükleme, süreç durumu, kabul mektubu indirme
- `admin.html` + `js/admin.js` — yönetim paneli: başvuru listesi/filtre,
  evrak onay/red, süreç durumu güncelleme, kabul mektubu yükleme, evrak
  türü yönetimi
- `js/supabaseClient.js`, `js/auth.js`, `js/i18n.js` — paylaşılan yardımcılar
- `sql/schema.sql` — veritabanı şeması, RLS politikaları, storage bucket'ı

## Güvenlik notları

- Supabase `anon` anahtarı client tarafında görünmesi güvenli olan anahtardır;
  gerçek erişim kontrolü veritabanındaki Row Level Security politikaları ve
  trigger'larla sağlanır (öğrenciler yalnızca kendi verilerini görür/düzenler,
  evrak onay/red ve kabul mektubu yalnızca admin tarafından değiştirilebilir).
- `service_role` anahtarını **asla** frontend koduna eklemeyin.
- Herkese açık bir admin kayıt formu yoktur; ilk admin yukarıdaki adımla
  manuel oluşturulur, sonraki adminler mevcut bir admin tarafından aynı SQL
  ile eklenebilir.

## Kapsam dışı (sonraki adımlar)

- E-posta bildirimleri (evrak onaylandı/reddedildi, kabul mektubu yüklendi)
- Danışman rolü (adminlerin belirli öğrencilere atanması)
- TR/EN dışında diller
- Ödeme/e-imza entegrasyonu
