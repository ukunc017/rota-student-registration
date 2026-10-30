// Varsayılan iletişim (DB boş/hata olursa). Canlı değerler site_settings tablosundan gelir.
window.ROTA_CONTACT_DEFAULTS = {
  company: "RotaEdu Turkey",
  email: "info@rotaedu.turkey",
  phone: "+90 XXX XXX XX XX",
  address: "İstanbul, Türkiye",
  hours: "Pzt–Cum 09:00–18:00",
  about: "",
  social: {
    instagram: "https://www.instagram.com/rotaeduturkey/",
    facebook: "",
    twitter: "",
    linkedin: "",
  },
};

window.ROTA_CONTACT = Object.assign({}, window.ROTA_CONTACT_DEFAULTS, {
  social: Object.assign({}, window.ROTA_CONTACT_DEFAULTS.social),
});

window.rotaContact = (function () {
  function mergeRow(row) {
    const base = window.ROTA_CONTACT_DEFAULTS;
    const social = Object.assign({}, base.social, (row && row.social) || {});
    return {
      company: (row && row.company) || base.company,
      email: (row && row.email) || base.email,
      phone: (row && row.phone) || base.phone,
      address: (row && row.address) || base.address,
      hours: (row && row.hours) || base.hours,
      about: (row && row.about) || base.about || "",
      social,
    };
  }

  async function load() {
    try {
      if (!window.rotaSupabase) {
        window.ROTA_CONTACT = mergeRow(null);
        return window.ROTA_CONTACT;
      }
      const { data, error } = await window.rotaSupabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error || !data) {
        window.ROTA_CONTACT = mergeRow(null);
        return window.ROTA_CONTACT;
      }
      window.ROTA_CONTACT = mergeRow(data);
      return window.ROTA_CONTACT;
    } catch {
      window.ROTA_CONTACT = mergeRow(null);
      return window.ROTA_CONTACT;
    }
  }

  async function save(payload) {
    const row = {
      id: 1,
      company: payload.company || null,
      email: payload.email || null,
      phone: payload.phone || null,
      address: payload.address || null,
      hours: payload.hours || null,
      about: payload.about || null,
      social: payload.social || {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await window.rotaSupabase.from("site_settings").upsert(row);
    if (error) throw error;
    window.ROTA_CONTACT = mergeRow(row);
    return window.ROTA_CONTACT;
  }

  return { load, save, mergeRow };
})();
