# Rota Education Consultancy — Öğrenci Kayıt Sistemi

Yurt dışından öğrencilerin Türkiye’deki anlaşmalı üniversiteleri inceleyip
Rota danışmanlığına başvurduğu, evrak ve kabul sürecinin tek panelden
takip edildiği web uygulaması. Öğrenci üniversiteye değil danışmanlığa başvurur.

Vanilla HTML/CSS/JS + [Supabase](https://supabase.com) (Postgres + Auth +
Storage) ile yazıldı, framework/build adımı yok.

## Kurulum

1. **Supabase projesi oluşturun:** [supabase.com](https://supabase.com) üzerinde
   ücretsiz bir proje açın.
2. **Şemayı çalıştırın:** Supabase Dashboard > SQL Editor'de
   [`sql/schema.sql`](sql/schema.sql) dosyasının tamamını yapıştırıp çalıştırın.
   Bu, tabloları, RLS politikalarını, `documents` storage bucket'ını,
   varsayılan 4 evrak türünü ve üniversite/program kataloğunu oluşturur.
   Şema daha önce çalıştırıldıysa yalnızca
   [`sql/add_universities_catalog.sql`](sql/add_universities_catalog.sql)
   dosyasını çalıştırın.
3. **API bilgilerinizi girin:** `js/config.example.js` dosyasını `js/config.js`
   olarak kopyalayın, Supabase Dashboard > Project Settings > API sayfasından
   aldığınız `Project URL` ve `anon public` anahtarını girin.
   ```bash
   cp js/config.example.js js/config.js
   ```
   `js/config.js` bilerek commit'lenir (bkz. Güvenlik notları).
4. **Siteyi çalıştırın:**
   ```bash
   npm install
   npm start
   ```
   veya Vercel CLI ile: `npm run dev`
5. **İlk admin hesabını oluşturun:** `account.html` üzerinden normal bir öğrenci
   gibi kaydolun, sonra Supabase SQL Editor'de kendi e-postanızla:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'sizin@eposta.com');
   ```
   çalıştırın. O hesapla giriş yaptığınızda otomatik olarak `admin.html`'e
   yönlendirilirsiniz. Yönetim panelindeki **Anlaşmalı üniversiteler** sekmesinden
   yeni anlaşmayı ekleyin; yayına alınca vitrinde görünür.

## Yapı

- `index.html` / `university.html` — üniversite ve bölüm vitrini
- `account.html` — öğrenci/admin giriş ve kayıt
- `student.html` + `js/student.js` — öğrenci paneli: tercih, evrak, süreç, kabul mektubu
- `admin.html` + `js/admin.js` — başvurular ve üniversite/bölüm kataloğu yönetimi
- `js/supabaseClient.js`, `js/auth.js`, `js/i18n.js`, `js/catalog.js` — paylaşılan yardımcılar
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

## Yayına alma (Vercel)

1. [vercel.com](https://vercel.com) hesabınıza GitHub ile giriş yapın.
2. **Add New... > Project** ile bu GitHub reposunu (`rota-student-registration`)
   import edin. Framework/build ayarı gerekmez, statik site olarak algılanır.
3. **Deploy**'a basın — birkaç saniye içinde `https://<proje-adi>.vercel.app`
   adresinde canlıya alınır.
4. Sonraki her `git push`, otomatik olarak yeni bir deployment tetikler.

## Kapsam dışı (sonraki adımlar)

- E-posta bildirimleri (evrak onaylandı/reddedildi, kabul mektubu yüklendi)
- Danışman rolü (adminlerin belirli öğrencilere atanması)
- TR/EN dışında diller
- Ödeme/e-imza entegrasyonu
