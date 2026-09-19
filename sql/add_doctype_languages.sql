-- Evrak türlerine Arapça/Farsça/Rusça etiket sütunları ekler.
-- sql/schema.sql zaten çalıştırıldıysa, sadece bu dosyayı ek olarak çalıştırın.
alter table public.document_types
  add column if not exists label_ar text,
  add column if not exists label_fa text,
  add column if not exists label_ru text;

-- Varsayılan 4 evrak türünün çevirilerini doldurur (admin panelinden
-- sonradan eklenen özel türler bu satırlardan etkilenmez).
update public.document_types set label_ar = 'جواز السفر', label_fa = 'گذرنامه', label_ru = 'Паспорт'
  where key = 'passport';
update public.document_types set label_ar = 'الشهادة / كشف الدرجات', label_fa = 'مدرک تحصیلی / ریز نمرات', label_ru = 'Диплом / Транскрипт'
  where key = 'diploma_transcript';
update public.document_types set label_ar = 'صورة شخصية', label_fa = 'عکس پرسنلی', label_ru = 'Фото'
  where key = 'photo';
update public.document_types set label_ar = 'شهادة اللغة', label_fa = 'مدرک زبان', label_ru = 'Сертификат владения языком'
  where key = 'language_certificate';

-- Admin panelinden eklenmiş diğer (özel) evrak türleri için Arapça/Farsça/
-- Rusça etiket boşsa İngilizce'ye düşer (admin panelinden düzenlenebilir).
update public.document_types set label_ar = label_en where label_ar is null;
update public.document_types set label_fa = label_en where label_fa is null;
update public.document_types set label_ru = label_en where label_ru is null;
