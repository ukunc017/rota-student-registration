-- 5 örnek anlaşmalı üniversite + her biri için 3 bölüm.
-- Supabase SQL Editor'de bir kez çalıştırın.
-- Aynı slug varsa üniversite güncellenir; bölümler yeniden eklenmez (slug bazlı kontrol yok, program adı+uni ile).

insert into public.universities (
  slug, name, city, kind, founded_year, website,
  instruction_languages, student_count, tuition_range, housing,
  about, admission_requirements, city_life, rota_note,
  active, sort_order
) values
(
  'istanbul-teknik-universitesi',
  'İstanbul Teknik Üniversitesi',
  'İstanbul',
  'public',
  1773,
  'https://www.itu.edu.tr',
  'Türkçe, İngilizce',
  '40.000+',
  'Devlet; yabancı öğrenci kontenjanı',
  'Kampüs yurtları mevcut',
  'Mühendislik ve teknik alanlarda Türkiye''nin önde gelen devlet üniversitelerinden biridir.',
  'Lise diploması, yabancı öğrenci sınavı veya uluslararası diploma (IB/A-Level), dil yeterliliği.',
  'Maslak–Ayazağa çevresi; metro ile şehir merkezine ulaşım.',
  'Rota üzerinden tercih ve evrak süreciniz yönetilir.',
  true,
  10
),
(
  'bogazici-universitesi',
  'Boğaziçi Üniversitesi',
  'İstanbul',
  'public',
  1863,
  'https://www.boun.edu.tr',
  'İngilizce',
  '16.000+',
  'Devlet; yabancı öğrenci kontenjanı',
  'Sınırlı yurt imkânı',
  'İngilizce eğitim veren, yüksek rekabetli bir devlet üniversitesidir.',
  'Güçlü akademik not ortalaması, İngilizce yeterlilik (TOEFL/IELTS), kabul sınavı/değerlendirme.',
  'Bebek–Hisarüstü; Boğaz manzaralı kampüs.',
  'Rota, başvuru dosyanızı ve takip sürecini yürütür.',
  true,
  20
),
(
  'koc-universitesi',
  'Koç Üniversitesi',
  'İstanbul',
  'private',
  1993,
  'https://www.ku.edu.tr',
  'İngilizce',
  '8.000+',
  'Özel üniversite ücretleri (programa göre değişir)',
  'Kampüs içi yurtlar',
  'Uluslararası odaklı, İngilizce eğitim veren özel bir üniversitedir.',
  'Transkript, dil belgesi, motivasyon mektubu; bazı programlarda mülakat.',
  'Sarıyer / Rumelifeneri kampüsü.',
  'Rota danışmanlığı ile başvuru ve evrak süreci takip edilir.',
  true,
  30
),
(
  'orta-dogu-teknik-universitesi',
  'Orta Doğu Teknik Üniversitesi',
  'Ankara',
  'public',
  1956,
  'https://www.metu.edu.tr',
  'İngilizce',
  '30.000+',
  'Devlet; yabancı öğrenci kontenjanı',
  'Geniş yurt kapasitesi',
  'Mühendislik ve fen bilimlerinde güçlü, İngilizce eğitim veren bir devlet üniversitesidir.',
  'Lise diploması, YÖS/uluslararası sınav, İngilizce yeterlilik.',
  'Üniversiteler Mahallesi; büyük yeşil kampüs.',
  'Rota üzerinden üniversite süreciniz yönetilir.',
  true,
  40
),
(
  'ege-universitesi',
  'Ege Üniversitesi',
  'İzmir',
  'public',
  1955,
  'https://www.ege.edu.tr',
  'Türkçe, İngilizce',
  '60.000+',
  'Devlet; yabancı öğrenci kontenjanı',
  'Kampüs yurtları',
  'Sağlık, mühendislik ve sosyal bilimlerde geniş program yelpazesi sunan bir devlet üniversitesidir.',
  'Lise diploması, yabancı öğrenci başvuru koşulları, dil yeterliliği.',
  'Bornova kampüsü; İzmir''in merkezi bölgelerine yakın.',
  'Rota, başvuru ve evrak takibini sizin adınıza yürütür.',
  true,
  50
)
on conflict (slug) do update set
  name = excluded.name,
  city = excluded.city,
  kind = excluded.kind,
  founded_year = excluded.founded_year,
  website = excluded.website,
  instruction_languages = excluded.instruction_languages,
  student_count = excluded.student_count,
  tuition_range = excluded.tuition_range,
  housing = excluded.housing,
  about = excluded.about,
  admission_requirements = excluded.admission_requirements,
  city_life = excluded.city_life,
  rota_note = excluded.rota_note,
  active = true,
  sort_order = excluded.sort_order;

-- Bölümler: aynı üniversite + aynı isimde kayıt yoksa ekle
with uni as (
  select id, slug from public.universities
  where slug in (
    'istanbul-teknik-universitesi',
    'bogazici-universitesi',
    'koc-universitesi',
    'orta-dogu-teknik-universitesi',
    'ege-universitesi'
  )
),
seed (uni_slug, name, faculty, degree, language, duration_years, tuition_note, description, sort_order) as (
  values
  -- İTÜ
  ('istanbul-teknik-universitesi', 'Bilgisayar Mühendisliği', 'Bilgisayar ve Bilişim Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Yazılım, sistemler ve yapay zekâ odaklı lisans programı.', 1),
  ('istanbul-teknik-universitesi', 'Endüstri Mühendisliği', 'İşletme Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Üretim, lojistik ve süreç optimizasyonu.', 2),
  ('istanbul-teknik-universitesi', 'Mimarlık', 'Mimarlık Fakültesi', 'bachelor', 'Türkçe', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Tasarım stüdyoları ve kentsel projeler.', 3),
  -- Boğaziçi
  ('bogazici-universitesi', 'İşletme', 'İktisadi ve İdari Bilimler Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Yönetim, finans ve pazarlama temelleri.', 1),
  ('bogazici-universitesi', 'Ekonomi', 'İktisadi ve İdari Bilimler Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Mikro/makro ekonomi ve veri analizi.', 2),
  ('bogazici-universitesi', 'Elektrik-Elektronik Mühendisliği', 'Mühendislik Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Elektronik, haberleşme ve güç sistemleri.', 3),
  -- Koç
  ('koc-universitesi', 'Uluslararası İlişkiler', 'İktisadi ve İdari Bilimler Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Özel üniversite ücreti', 'Küresel siyaset ve diplomasi.', 1),
  ('koc-universitesi', 'Hukuk', 'Hukuk Fakültesi', 'bachelor', 'Türkçe / İngilizce', 4::numeric, 'Özel üniversite ücreti', 'Türk ve karşılaştırmalı hukuk.', 2),
  ('koc-universitesi', 'Moleküler Biyoloji ve Genetik', 'Fen Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Özel üniversite ücreti', 'Laboratuvar ve araştırma odaklı program.', 3),
  -- ODTÜ
  ('orta-dogu-teknik-universitesi', 'Makine Mühendisliği', 'Mühendislik Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Tasarım, termodinamik ve üretim.', 1),
  ('orta-dogu-teknik-universitesi', 'İnşaat Mühendisliği', 'Mühendislik Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Yapı, zemin ve altyapı mühendisliği.', 2),
  ('orta-dogu-teknik-universitesi', 'Şehir ve Bölge Planlama', 'Mimarlık Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Kentsel planlama ve sürdürülebilir gelişme.', 3),
  -- Ege
  ('ege-universitesi', 'Tıp', 'Tıp Fakültesi', 'bachelor', 'Türkçe', 6::numeric, 'Yabancı öğrenci ücreti programına göre', 'Klinik eğitim içeren tıp fakültesi programı.', 1),
  ('ege-universitesi', 'Hemşirelik', 'Hemşirelik Fakültesi', 'bachelor', 'Türkçe', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Klinik uygulama ağırlıklı hemşirelik eğitimi.', 2),
  ('ege-universitesi', 'Turizm İşletmeciliği', 'Turizm Fakültesi', 'bachelor', 'İngilizce', 4::numeric, 'Yabancı öğrenci ücreti programına göre', 'Otelcilik ve destinasyon yönetimi.', 3)
)
insert into public.programs (
  university_id, name, faculty, degree, language, duration_years,
  tuition_note, description, active, sort_order
)
select
  u.id,
  s.name,
  s.faculty,
  s.degree,
  s.language,
  s.duration_years,
  s.tuition_note,
  s.description,
  true,
  s.sort_order
from seed s
join uni u on u.slug = s.uni_slug
where not exists (
  select 1 from public.programs p
  where p.university_id = u.id and p.name = s.name
);
