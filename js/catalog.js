(function () {
  const sb = () => window.rotaSupabase;
  const t = (k) => window.rotaI18n.t(k);
  const PREF_KEY = "rota_apply_pref";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function kindLabel(kind) {
    return kind === "private" ? t("uni_kind_private") : t("uni_kind_public");
  }

  function degreeLabel(degree) {
    return t("degree_" + degree) || degree;
  }

  function snippet(text, n) {
    const s = (text || "").trim();
    if (!s) return "";
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  }

  function saveApplyPref(pref) {
    sessionStorage.setItem(PREF_KEY, JSON.stringify(pref));
  }

  function loadApplyPref() {
    try {
      return JSON.parse(sessionStorage.getItem(PREF_KEY) || "null");
    } catch {
      return null;
    }
  }

  function bindApplyLinks(root, universities) {
    root.querySelectorAll("[data-apply-uni]").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.preventDefault();
        const uni = universities.find((u) => u.id === el.getAttribute("data-apply-uni"));
        const program = uni?.programs.find((p) => p.id === el.getAttribute("data-apply-program")) || null;
        saveApplyPref({
          universityId: uni?.id || null,
          programId: program?.id || null,
          universityName: uni?.name || "",
          programName: program?.name || "",
        });
        const auth = await window.rotaAuth.getCurrentProfile();
        if (!auth) {
          // serve, .html?query adreslerinde query'yi düşürür; uzantısız kullan
          window.location.href = "account.html?next=student";
          return;
        }
        window.location.href = auth.profile.role === "admin" ? "admin.html" : "student.html";
      });
    });
  }

  async function loadCatalog() {
    const { data: universities, error } = await sb()
      .from("universities")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name");
    if (error) throw error;
    const { data: programs, error: pErr } = await sb()
      .from("programs")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name");
    if (pErr) throw pErr;
    const byUni = {};
    (programs || []).forEach((p) => {
      (byUni[p.university_id] ||= []).push(p);
    });
    return (universities || []).map((u) => ({ ...u, programs: byUni[u.id] || [] }));
  }

  function facts(uni) {
    const items = [
      uni.city && [t("uni_city"), uni.city],
      uni.kind && [t("uni_kind"), kindLabel(uni.kind)],
      uni.founded_year && [t("uni_founded"), String(uni.founded_year)],
      uni.instruction_languages && [t("uni_languages"), uni.instruction_languages],
      uni.student_count && [t("uni_students"), uni.student_count],
      uni.tuition_range && [t("uni_tuition"), uni.tuition_range],
      uni.housing && [t("uni_housing"), uni.housing],
    ].filter(Boolean);
    if (!items.length) return "";
    return `<dl class="fact-list">${items
      .map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`)
      .join("")}</dl>`;
  }

  function section(titleKey, body) {
    if (!(body || "").trim()) return "";
    return `<section class="detail-block"><h2>${t(titleKey)}</h2><p class="detail-copy">${escapeHtml(body)}</p></section>`;
  }

  function programCard(uni, p, { compact } = {}) {
    const meta = [degreeLabel(p.degree), p.language, p.duration_years ? `${p.duration_years} ${t("program_years")}` : ""]
      .filter(Boolean)
      .join(" · ");
    return `
      <article class="program-card" id="program-${escapeHtml(p.id)}">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          ${p.faculty ? `<p class="muted">${escapeHtml(p.faculty)}</p>` : ""}
          <p class="muted">${escapeHtml(meta)}</p>
          ${!compact && p.description ? `<p>${escapeHtml(p.description)}</p>` : ""}
          ${!compact && p.tuition_note ? `<p class="muted">${t("program_tuition")}: ${escapeHtml(p.tuition_note)}</p>` : ""}
          ${!compact && p.entry_requirements ? `<p><strong>${t("program_entry")}</strong> ${escapeHtml(p.entry_requirements)}</p>` : ""}
          ${!compact && p.career_note ? `<p><strong>${t("program_career")}</strong> ${escapeHtml(p.career_note)}</p>` : ""}
        </div>
        <a class="btn" href="account.html?next=student" data-apply-uni="${escapeHtml(uni.id)}" data-apply-program="${escapeHtml(p.id)}">${t("catalog_apply")}</a>
      </article>`;
  }

  function renderHome(list, query) {
    const q = (query || "").trim().toLowerCase();
    const filtered = list.filter((u) => {
      if (!q) return true;
      const hay = `${u.name} ${u.city || ""} ${u.about || ""} ${u.programs.map((p) => p.name).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    const app = document.getElementById("app");
    app.innerHTML = `
      <section class="catalog-hero">
        <p class="catalog-kicker">${t("catalog_kicker")}</p>
        <h1>${t("catalog_title")}</h1>
        <p class="catalog-lead">${t("catalog_lead")}</p>
        <div class="table-toolbar">
          <input type="search" id="catalog-search" placeholder="${t("catalog_search")}" value="${escapeHtml(query || "")}" />
        </div>
      </section>
      ${
        filtered.length === 0
          ? `<p class="empty-state">${t("catalog_empty")}</p>`
          : `<div class="uni-grid">${filtered
              .map(
                (u) => `
            <article class="uni-card">
              <div class="uni-card-top"></div>
              <div class="uni-card-body">
                <h2>${escapeHtml(u.name)}</h2>
                <p class="muted">${escapeHtml([u.city, kindLabel(u.kind)].filter(Boolean).join(" · "))}</p>
                <p>${escapeHtml(snippet(u.about, 160) || t("catalog_no_summary"))}</p>
                <p class="muted">${u.programs.length} ${t("catalog_program_count")}</p>
                <div class="uni-card-actions">
                  <a class="btn btn-secondary" href="university.html?slug=${encodeURIComponent(u.slug)}">${t("catalog_view")}</a>
                  <a class="btn" href="account.html?next=student" data-apply-uni="${escapeHtml(u.id)}" data-apply-program="${escapeHtml((u.programs[0] && u.programs[0].id) || "")}">${t("catalog_apply")}</a>
                </div>
              </div>
            </article>`
              )
              .join("")}</div>`
      }
      <p class="catalog-footnote">${t("catalog_apply_note")}</p>
    `;
    bindApplyLinks(app, list);
    const search = document.getElementById("catalog-search");
    search.addEventListener("input", (e) => {
      renderHome(list, e.target.value);
      const el = document.getElementById("catalog-search");
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  function renderUniversity(uni) {
    const app = document.getElementById("app");
    if (!uni) {
      app.innerHTML = `<p class="empty-state">${t("catalog_uni_missing")}</p>`;
      return;
    }
    const website = uni.website
      ? `<p><a href="${escapeHtml(uni.website)}" rel="noopener noreferrer">${t("uni_website")}</a></p>`
      : "";
    app.innerHTML = `
      <p class="crumb"><a href="/">${t("nav_universities")}</a> / ${escapeHtml(uni.name)}</p>
      <div class="uni-header">
        <div>
          <h1>${escapeHtml(uni.name)}</h1>
          <p class="muted">${escapeHtml([uni.city, kindLabel(uni.kind)].filter(Boolean).join(" · "))}</p>
        </div>
        <a class="btn btn-accent" href="account.html?next=student" data-apply-uni="${escapeHtml(uni.id)}" data-apply-program="${escapeHtml((uni.programs[0] && uni.programs[0].id) || "")}">${t("catalog_apply")}</a>
      </div>
      <p class="rota-callout">${t("catalog_apply_note")}</p>
      ${facts(uni)}
      ${website}
      ${section("uni_about", uni.about)}
      ${section("uni_admission", uni.admission_requirements)}
      ${section("uni_city_life", uni.city_life)}
      ${section("uni_rota_note", uni.rota_note)}
      <h2>${t("uni_programs")}</h2>
      ${
        uni.programs.length
          ? `<div class="program-list">${uni.programs.map((p) => programCard(uni, p)).join("")}</div>`
          : `<p class="muted">${t("uni_no_programs")}</p>`
      }
    `;
    bindApplyLinks(app, [uni]);
  }

  async function paintAuthLinks() {
    const result = await window.rotaAuth.getCurrentProfile();
    const slot = document.getElementById("auth-slot");
    if (!slot) return;
    if (!result) {
      slot.innerHTML = `<a class="btn-logout" href="account.html">${t("nav_sign_in")}</a>`;
      return;
    }
    const href = result.profile.role === "admin" ? "admin.html" : "student.html";
    const label = result.profile.role === "admin" ? t("nav_admin") : t("nav_my_file");
    slot.innerHTML = `<a class="btn-logout" href="${href}">${label}</a>`;
  }

  window.rotaCatalog = {
    escapeHtml,
    kindLabel,
    degreeLabel,
    loadCatalog,
    saveApplyPref,
    loadApplyPref,
  };

  (async function init() {
    const page = document.body.getAttribute("data-page");
    if (page !== "catalog" && page !== "university") return;
    window.rotaI18n.applyI18n();
    await paintAuthLinks();
    const app = document.getElementById("app");
    try {
      const list = await loadCatalog();
      if (page === "catalog") {
        renderHome(list, "");
      } else {
        const slug = new URLSearchParams(location.search).get("slug");
        const uni = list.find((u) => u.slug === slug);
        renderUniversity(uni);
      }
    } catch (err) {
      app.innerHTML = `<p class="empty-state">${escapeHtml(err.message || t("auth_error_generic"))}</p>
        <p class="muted" style="text-align:center">${t("catalog_sql_hint")}</p>`;
    }
  })();
})();
