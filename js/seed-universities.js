// Örnek üniversite + bölüm kataloğu (admin oturumu ile yazılır).
(function () {
  const SAMPLE = [
    {
      slug: "istanbul-teknik-universitesi",
      name: "İstanbul Teknik Üniversitesi",
      city: "İstanbul",
      kind: "public",
      founded_year: 1773,
      website: "https://www.itu.edu.tr",
      instruction_languages: "Türkçe, İngilizce",
      student_count: "40.000+",
      tuition_range: "Devlet; yabancı öğrenci kontenjanı",
      housing: "Kampüs yurtları mevcut",
      about: "Mühendislik ve teknik alanlarda Türkiye'nin önde gelen devlet üniversitelerinden biridir.",
      admission_requirements: "Lise diploması, yabancı öğrenci sınavı veya uluslararası diploma, dil yeterliliği.",
      city_life: "Maslak–Ayazağa çevresi; metro ile şehir merkezine ulaşım.",
      rota_note: "Rota üzerinden tercih ve evrak süreciniz yönetilir.",
      active: true,
      sort_order: 10,
      programs: [
        { name: "Bilgisayar Mühendisliği", faculty: "Bilgisayar ve Bilişim Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Yazılım, sistemler ve yapay zekâ odaklı lisans programı.", sort_order: 1 },
        { name: "Endüstri Mühendisliği", faculty: "İşletme Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Üretim, lojistik ve süreç optimizasyonu.", sort_order: 2 },
        { name: "Mimarlık", faculty: "Mimarlık Fakültesi", degree: "bachelor", language: "Türkçe", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Tasarım stüdyoları ve kentsel projeler.", sort_order: 3 },
      ],
    },
    {
      slug: "bogazici-universitesi",
      name: "Boğaziçi Üniversitesi",
      city: "İstanbul",
      kind: "public",
      founded_year: 1863,
      website: "https://www.boun.edu.tr",
      instruction_languages: "İngilizce",
      student_count: "16.000+",
      tuition_range: "Devlet; yabancı öğrenci kontenjanı",
      housing: "Sınırlı yurt imkânı",
      about: "İngilizce eğitim veren, yüksek rekabetli bir devlet üniversitesidir.",
      admission_requirements: "Güçlü akademik not ortalaması, İngilizce yeterlilik, kabul değerlendirmesi.",
      city_life: "Bebek–Hisarüstü; Boğaz manzaralı kampüs.",
      rota_note: "Rota, başvuru dosyanızı ve takip sürecini yürütür.",
      active: true,
      sort_order: 20,
      programs: [
        { name: "İşletme", faculty: "İktisadi ve İdari Bilimler Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Yönetim, finans ve pazarlama temelleri.", sort_order: 1 },
        { name: "Ekonomi", faculty: "İktisadi ve İdari Bilimler Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Mikro/makro ekonomi ve veri analizi.", sort_order: 2 },
        { name: "Elektrik-Elektronik Mühendisliği", faculty: "Mühendislik Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Elektronik, haberleşme ve güç sistemleri.", sort_order: 3 },
      ],
    },
    {
      slug: "koc-universitesi",
      name: "Koç Üniversitesi",
      city: "İstanbul",
      kind: "private",
      founded_year: 1993,
      website: "https://www.ku.edu.tr",
      instruction_languages: "İngilizce",
      student_count: "8.000+",
      tuition_range: "Özel üniversite ücretleri (programa göre değişir)",
      housing: "Kampüs içi yurtlar",
      about: "Uluslararası odaklı, İngilizce eğitim veren özel bir üniversitedir.",
      admission_requirements: "Transkript, dil belgesi, motivasyon mektubu; bazı programlarda mülakat.",
      city_life: "Sarıyer / Rumelifeneri kampüsü.",
      rota_note: "Rota danışmanlığı ile başvuru ve evrak süreci takip edilir.",
      active: true,
      sort_order: 30,
      programs: [
        { name: "Uluslararası İlişkiler", faculty: "İktisadi ve İdari Bilimler Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Özel üniversite ücreti", description: "Küresel siyaset ve diplomasi.", sort_order: 1 },
        { name: "Hukuk", faculty: "Hukuk Fakültesi", degree: "bachelor", language: "Türkçe / İngilizce", duration_years: 4, tuition_note: "Özel üniversite ücreti", description: "Türk ve karşılaştırmalı hukuk.", sort_order: 2 },
        { name: "Moleküler Biyoloji ve Genetik", faculty: "Fen Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Özel üniversite ücreti", description: "Laboratuvar ve araştırma odaklı program.", sort_order: 3 },
      ],
    },
    {
      slug: "orta-dogu-teknik-universitesi",
      name: "Orta Doğu Teknik Üniversitesi",
      city: "Ankara",
      kind: "public",
      founded_year: 1956,
      website: "https://www.metu.edu.tr",
      instruction_languages: "İngilizce",
      student_count: "30.000+",
      tuition_range: "Devlet; yabancı öğrenci kontenjanı",
      housing: "Geniş yurt kapasitesi",
      about: "Mühendislik ve fen bilimlerinde güçlü, İngilizce eğitim veren bir devlet üniversitesidir.",
      admission_requirements: "Lise diploması, YÖS/uluslararası sınav, İngilizce yeterlilik.",
      city_life: "Üniversiteler Mahallesi; büyük yeşil kampüs.",
      rota_note: "Rota üzerinden üniversite süreciniz yönetilir.",
      active: true,
      sort_order: 40,
      programs: [
        { name: "Makine Mühendisliği", faculty: "Mühendislik Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Tasarım, termodinamik ve üretim.", sort_order: 1 },
        { name: "İnşaat Mühendisliği", faculty: "Mühendislik Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Yapı, zemin ve altyapı mühendisliği.", sort_order: 2 },
        { name: "Şehir ve Bölge Planlama", faculty: "Mimarlık Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Kentsel planlama ve sürdürülebilir gelişme.", sort_order: 3 },
      ],
    },
    {
      slug: "ege-universitesi",
      name: "Ege Üniversitesi",
      city: "İzmir",
      kind: "public",
      founded_year: 1955,
      website: "https://www.ege.edu.tr",
      instruction_languages: "Türkçe, İngilizce",
      student_count: "60.000+",
      tuition_range: "Devlet; yabancı öğrenci kontenjanı",
      housing: "Kampüs yurtları",
      about: "Sağlık, mühendislik ve sosyal bilimlerde geniş program yelpazesi sunan bir devlet üniversitesidir.",
      admission_requirements: "Lise diploması, yabancı öğrenci başvuru koşulları, dil yeterliliği.",
      city_life: "Bornova kampüsü; İzmir'in merkezi bölgelerine yakın.",
      rota_note: "Rota, başvuru ve evrak takibini sizin adınıza yürütür.",
      active: true,
      sort_order: 50,
      programs: [
        { name: "Tıp", faculty: "Tıp Fakültesi", degree: "bachelor", language: "Türkçe", duration_years: 6, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Klinik eğitim içeren tıp fakültesi programı.", sort_order: 1 },
        { name: "Hemşirelik", faculty: "Hemşirelik Fakültesi", degree: "bachelor", language: "Türkçe", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Klinik uygulama ağırlıklı hemşirelik eğitimi.", sort_order: 2 },
        { name: "Turizm İşletmeciliği", faculty: "Turizm Fakültesi", degree: "bachelor", language: "İngilizce", duration_years: 4, tuition_note: "Yabancı öğrenci ücreti programına göre", description: "Otelcilik ve destinasyon yönetimi.", sort_order: 3 },
      ],
    },
  ];

  async function seedSampleUniversities(sb) {
    let createdUnis = 0;
    let createdPrograms = 0;
    for (const item of SAMPLE) {
      const { programs, ...uni } = item;
      const { data: existing } = await sb.from("universities").select("id").eq("slug", uni.slug).maybeSingle();
      let uniId = existing?.id;
      if (!uniId) {
        const { data, error } = await sb.from("universities").insert(uni).select("id").single();
        if (error) throw error;
        uniId = data.id;
        createdUnis += 1;
      } else {
        const { error } = await sb.from("universities").update({ ...uni, active: true }).eq("id", uniId);
        if (error) throw error;
      }
      for (const p of programs) {
        const { data: existingP } = await sb
          .from("programs")
          .select("id")
          .eq("university_id", uniId)
          .eq("name", p.name)
          .maybeSingle();
        if (existingP) continue;
        const { error } = await sb.from("programs").insert({ ...p, university_id: uniId, active: true });
        if (error) throw error;
        createdPrograms += 1;
      }
    }
    return { createdUnis, createdPrograms, totalUnis: SAMPLE.length };
  }

  window.rotaSeed = { seedSampleUniversities, SAMPLE };
})();
