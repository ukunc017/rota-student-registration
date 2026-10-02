(function () {
  const sb = () => window.rotaSupabase;
  const t = (k) => window.rotaI18n.t(k);
  const STATUS_ORDER = ["pre_registration", "documents_pending", "under_review", "accepted", "completed"];
  const STATUS_LABEL_KEY = {
    pre_registration: "step_pre_registration",
    documents_pending: "step_documents_pending",
    under_review: "step_under_review",
    accepted: "step_accepted",
    completed: "step_completed",
  };

  const state = {
    view: "list",
    profile: null,
    applications: [],
    documentTypesAll: [],
    docTypeUsage: {},
    filterStatus: "",
    filterYear: String(new Date().getFullYear()),
    search: "",
    selectedId: null,
    detail: null,
    tab: "apps",
    universities: [],
    editUniversity: null,
    editPrograms: [],
    editingDocTypeId: null,
  };

  async function loadApplications() {
    const { data, error } = await sb()
      .from("applications")
      .select("*, profile:profiles!applications_student_id_fkey(full_name, email, nationality)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    state.applications = data || [];
  }

  async function loadUniversities() {
    const { data, error } = await sb().from("universities").select("*").order("sort_order").order("name");
    if (error) throw error;
    const { data: programs } = await sb().from("programs").select("*").order("sort_order").order("name");
    const byUni = {};
    (programs || []).forEach((p) => {
      (byUni[p.university_id] ||= []).push(p);
    });
    state.universities = (data || []).map((u) => ({ ...u, programs: byUni[u.id] || [] }));
  }

  function slugify(name) {
    return (
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "university"
    );
  }

  function esc(v) {
    return window.rotaCatalog.escapeHtml(v);
  }

  function adminNav() {
    return `
      <div class="admin-tabs">
        <button type="button" class="btn ${state.tab === "apps" ? "" : "btn-secondary"} btn-sm" data-tab="apps">${t("admin_nav_applications")}</button>
        <button type="button" class="btn ${state.tab === "unis" ? "" : "btn-secondary"} btn-sm" data-tab="unis">${t("admin_nav_universities")}</button>
      </div>`;
  }

  function bindAdminNav() {
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.tab = btn.getAttribute("data-tab");
        state.view = "list";
        state.editUniversity = null;
        if (state.tab === "unis") {
          try {
            await loadUniversities();
          } catch (err) {
            document.getElementById("app").innerHTML = `<p class="empty-state">${esc(err.message)}</p><p class="muted" style="text-align:center">${t("catalog_sql_hint")}</p>`;
            return;
          }
        }
        render();
      });
    });
  }

  async function loadDocumentTypesAll() {
    const { data, error } = await sb().from("document_types").select("*").order("sort_order");
    if (error) throw error;
    state.documentTypesAll = data || [];
    const { data: docs } = await sb().from("documents").select("document_type_id");
    const usage = {};
    (docs || []).forEach((d) => {
      usage[d.document_type_id] = (usage[d.document_type_id] || 0) + 1;
    });
    state.docTypeUsage = usage;
  }

  async function loadDetail(applicationId) {
    const { data: application, error } = await sb()
      .from("applications")
      .select("*, profile:profiles!applications_student_id_fkey(full_name, email, phone, nationality)")
      .eq("id", applicationId)
      .single();
    if (error) throw error;
    const { data: documents } = await sb().from("documents").select("*").eq("application_id", applicationId);
    state.detail = { application, documents: documents || [] };
  }

  // Yeni sekme açmak (window.open) yerine mevcut sekmede yönlendirir —
  // tarayıcılar arasında pop-up engelleyici davranışı tutarsız olduğundan
  // (Chrome/Firefox farklı davranıyor) en güvenilir yöntem bu.
  async function openSignedUrl(storagePath) {
    const { data, error } = await sb().storage.from("documents").createSignedUrl(storagePath, 600);
    if (error) return alert(error.message);
    window.location.href = data.signedUrl;
  }

  function statusBadge(status) {
    const map = {
      missing: ["badge-missing", "document_status_missing"],
      pending: ["badge-pending", "document_status_pending"],
      approved: ["badge-approved", "document_status_approved"],
      rejected: ["badge-rejected", "document_status_rejected"],
    };
    const [cls, key] = map[status];
    return `<span class="badge ${cls}">${t(key)}</span>`;
  }

  const DATE_LOCALES = { tr: "tr-TR", en: "en-US", ar: "ar-EG", fa: "fa-IR", ru: "ru-RU" };
  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(DATE_LOCALES[window.rotaI18n.getLang()] || "en-US");
  }

  // ---------------------------------------------------------------- LIST --
  function availableYears() {
    const years = new Set(state.applications.map((a) => new Date(a.created_at).getFullYear()));
    years.add(new Date().getFullYear());
    return [...years].sort((a, b) => b - a);
  }

  function filteredApplications() {
    const q = state.search.trim().toLowerCase();
    const year = state.filterYear ? Number(state.filterYear) : null;
    return state.applications.filter((a) => {
      if (state.filterStatus && a.status !== state.filterStatus) return false;
      if (year && new Date(a.created_at).getFullYear() !== year) return false;
      if (!q) return true;
      const hay = `${a.profile?.full_name || ""} ${a.profile?.email || ""} ${a.profile?.nationality || ""} ${a.target_university || ""} ${a.target_program || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderDocTypeEditor(dt) {
    return `
      <form class="doctype-edit-form" data-edit-doctype-form="${dt.id}">
        <div class="row">
          <div class="field">
            <label>Türkçe *</label>
            <input type="text" name="label_tr" value="${esc(dt.label_tr || "")}" required />
          </div>
          <div class="field">
            <label>English *</label>
            <input type="text" name="label_en" value="${esc(dt.label_en || "")}" required />
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>العربية</label>
            <input type="text" name="label_ar" value="${esc(dt.label_ar || "")}" dir="rtl" />
          </div>
          <div class="field">
            <label>فارسی</label>
            <input type="text" name="label_fa" value="${esc(dt.label_fa || "")}" dir="rtl" />
          </div>
          <div class="field">
            <label>Русский</label>
            <input type="text" name="label_ru" value="${esc(dt.label_ru || "")}" />
          </div>
        </div>
        <div class="doctype-actions">
          <button type="submit" class="btn btn-sm">${t("admin_document_type_save")}</button>
          <button type="button" class="btn btn-secondary btn-sm" data-cancel-edit-doctype>${t("admin_document_type_cancel")}</button>
        </div>
      </form>`;
  }

  function renderDocTypeManager() {
    return `
      <div class="card">
        <h2>${t("admin_document_types_title")}</h2>
        ${state.documentTypesAll
          .map((dt) => {
            if (state.editingDocTypeId === dt.id) {
              return `<div class="doctype-row editing ${dt.active ? "" : "inactive"}">${renderDocTypeEditor(dt)}</div>`;
            }
            const used = state.docTypeUsage[dt.id] || 0;
            return `
          <div class="doctype-row ${dt.active ? "" : "inactive"}">
            <span>${esc(dt.label_tr)} / ${esc(dt.label_en)}${dt.label_ar ? " / " + esc(dt.label_ar) : ""}${
              dt.label_fa ? " / " + esc(dt.label_fa) : ""
            }${dt.label_ru ? " / " + esc(dt.label_ru) : ""}</span>
            <div class="doctype-actions">
              <button type="button" class="btn btn-secondary btn-sm" data-edit-doctype="${dt.id}">${t("admin_document_type_edit")}</button>
              <button type="button" class="btn btn-secondary btn-sm" data-toggle-doctype="${dt.id}" data-active="${dt.active}">
                ${dt.active ? t("admin_document_type_deactivate") : t("admin_document_type_activate")}
              </button>
              <button type="button" class="btn btn-danger btn-sm" data-delete-doctype="${dt.id}" data-used="${used}" ${
                used > 0 ? "disabled title=\"" + esc(t("admin_document_type_delete_in_use")) + "\"" : ""
              }>${t("admin_document_type_delete")}</button>
            </div>
          </div>`;
          })
          .join("")}
        <form id="add-doctype-form" class="spaced-top">
          <div class="row">
            <div class="field">
              <label>Türkçe *</label>
              <input type="text" id="new-doctype-tr" required />
            </div>
            <div class="field">
              <label>English *</label>
              <input type="text" id="new-doctype-en" required />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>العربية</label>
              <input type="text" id="new-doctype-ar" dir="rtl" />
            </div>
            <div class="field">
              <label>فارسی</label>
              <input type="text" id="new-doctype-fa" dir="rtl" />
            </div>
            <div class="field">
              <label>Русский</label>
              <input type="text" id="new-doctype-ru" />
            </div>
          </div>
          <p class="muted" style="margin: 0 0 10px">${t("admin_document_type_optional_hint")}</p>
          <button type="submit" class="btn btn-sm">${t("admin_document_type_add")}</button>
        </form>
      </div>`;
  }

  function renderList() {
    const rows = filteredApplications();
    const app = document.getElementById("app");
    app.innerHTML = `
      ${adminNav()}
      <div class="card">
        <h2>${t("admin_title")}</h2>
        <div class="table-toolbar">
          <input type="text" id="search-input" data-i18n-placeholder="admin_search_placeholder" placeholder="${t(
            "admin_search_placeholder"
          )}" value="${esc(state.search)}" />
          <select id="year-filter" aria-label="${t("admin_filter_year")}">
            <option value="">${t("admin_filter_all_years")}</option>
            ${availableYears()
              .map((y) => `<option value="${y}" ${state.filterYear === String(y) ? "selected" : ""}>${y}</option>`)
              .join("")}
          </select>
          <select id="status-filter">
            <option value="">${t("admin_filter_all_status")}</option>
            ${STATUS_ORDER.map(
              (s) => `<option value="${s}" ${state.filterStatus === s ? "selected" : ""}>${t(STATUS_LABEL_KEY[s])}</option>`
            ).join("")}
          </select>
        </div>
        ${
          rows.length === 0
            ? `<p class="empty-state">${t("admin_no_results")}</p>`
            : `<table class="data-table">
                <thead>
                  <tr>
                    <th>${t("admin_table_name")}</th>
                    <th>${t("application_choose_university")}</th>
                    <th>${t("admin_table_nationality")}</th>
                    <th>${t("admin_table_status")}</th>
                    <th>${t("admin_table_registered")}</th>
                    <th>${t("admin_table_updated")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (a) => `
                    <tr data-open-app="${a.id}">
                      <td>${esc(a.profile?.full_name || "—")}<br/><span class="muted">${esc(a.profile?.email || "")}</span></td>
                      <td>${esc(a.target_university || "—")}<br/><span class="muted">${esc(a.target_program || "")}</span></td>
                      <td>${esc(a.profile?.nationality || "—")}</td>
                      <td>${statusBadge_forApp(a.status)}</td>
                      <td>${fmtDate(a.created_at)}</td>
                      <td>${fmtDate(a.updated_at)}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>`
        }
      </div>
      ${renderDocTypeManager()}
    `;
    window.rotaI18n.applyI18n();
    bindAdminNav();
    attachListHandlers();
  }

  function renderUniversityList() {
    const app = document.getElementById("app");
    app.innerHTML = `
      ${adminNav()}
      <div class="card">
        <div class="row">
          <h2 style="margin:0">${t("admin_universities_title")}</h2>
          <div class="toolbar-right">
            <button type="button" class="btn" id="add-uni-btn">${t("admin_university_add")}</button>
          </div>
        </div>
        ${
          state.universities.length === 0
            ? `<p class="empty-state">${t("admin_no_universities")}</p>`
            : `<table class="data-table spaced-top">
                <thead>
                  <tr>
                    <th>${t("admin_field_name")}</th>
                    <th>${t("admin_field_city")}</th>
                    <th>${t("admin_programs_title")}</th>
                    <th>${t("admin_publish_status")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${state.universities
                    .map(
                      (u) => `
                    <tr data-edit-uni="${u.id}" class="${u.active ? "" : "row-unpublished"}">
                      <td>${esc(u.name)}</td>
                      <td>${esc(u.city || "—")}</td>
                      <td>${u.programs.length}</td>
                      <td>
                        <span class="badge ${u.active ? "badge-approved" : "badge-missing"}">
                          ${u.active ? t("admin_status_published") : t("admin_status_draft")}
                        </span>
                      </td>
                      <td class="col-actions">
                        <button type="button" class="btn ${u.active ? "btn-secondary" : ""} btn-sm" data-toggle-publish="${u.id}" data-active="${u.active}">
                          ${u.active ? t("admin_unpublish") : t("admin_publish")}
                        </button>
                      </td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>`
        }
      </div>`;
    bindAdminNav();
    document.getElementById("add-uni-btn").addEventListener("click", () => {
      state.editUniversity = {
        id: null,
        name: "",
        slug: "",
        city: "",
        kind: "public",
        founded_year: "",
        website: "",
        instruction_languages: "",
        student_count: "",
        tuition_range: "",
        housing: "",
        about: "",
        admission_requirements: "",
        city_life: "",
        rota_note: "",
        active: false,
      };
      state.editPrograms = [];
      state.view = "uni-edit";
      render();
    });
    document.querySelectorAll("[data-edit-uni]").forEach((row) => {
      row.addEventListener("click", () => {
        const uni = state.universities.find((u) => u.id === row.getAttribute("data-edit-uni"));
        state.editUniversity = { ...uni };
        state.editPrograms = (uni.programs || []).map((p) => ({ ...p }));
        state.view = "uni-edit";
        render();
      });
    });
    document.querySelectorAll("[data-toggle-publish]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-toggle-publish");
        const active = btn.getAttribute("data-active") === "true";
        const { error } = await sb().from("universities").update({ active: !active }).eq("id", id);
        if (error) return alert(error.message);
        await loadUniversities();
        renderUniversityList();
      });
    });
  }

  function fieldInput(id, label, value, type) {
    const v = value == null ? "" : value;
    if (type === "textarea") {
      return `<div class="field"><label>${label}</label><textarea id="${id}" rows="4">${esc(v)}</textarea></div>`;
    }
    if (type === "checkbox") {
      return `<div class="field"><label class="check-label"><input type="checkbox" id="${id}" ${value ? "checked" : ""} /> ${label}</label></div>`;
    }
    return `<div class="field"><label>${label}</label><input type="${type || "text"}" id="${id}" value="${esc(v)}" /></div>`;
  }

  function renderUniversityEdit() {
    const u = state.editUniversity;
    const app = document.getElementById("app");
    app.innerHTML = `
      ${adminNav()}
      <button type="button" class="link-btn" id="back-unis">&larr; ${t("admin_back_universities")}</button>
      <div class="card spaced-top">
        <h2>${u.id ? t("admin_university_edit") : t("admin_university_add")}</h2>
        <form id="uni-form">
          ${fieldInput("uni-name", t("admin_field_name"), u.name)}
          ${fieldInput("uni-slug", t("admin_field_slug"), u.slug)}
          <div class="row">
            ${fieldInput("uni-city", t("admin_field_city"), u.city)}
            <div class="field">
              <label>${t("admin_field_kind")}</label>
              <select id="uni-kind">
                <option value="public" ${u.kind === "public" ? "selected" : ""}>${t("uni_kind_public")}</option>
                <option value="private" ${u.kind === "private" ? "selected" : ""}>${t("uni_kind_private")}</option>
              </select>
            </div>
          </div>
          <div class="row">
            ${fieldInput("uni-founded", t("admin_field_founded"), u.founded_year, "number")}
            ${fieldInput("uni-website", t("admin_field_website"), u.website, "url")}
          </div>
          ${fieldInput("uni-languages", t("admin_field_languages"), u.instruction_languages)}
          <div class="row">
            ${fieldInput("uni-students", t("admin_field_students"), u.student_count)}
            ${fieldInput("uni-tuition", t("admin_field_tuition"), u.tuition_range)}
          </div>
          ${fieldInput("uni-housing", t("admin_field_housing"), u.housing)}
          ${fieldInput("uni-about", t("admin_field_about"), u.about, "textarea")}
          ${fieldInput("uni-admission", t("admin_field_admission"), u.admission_requirements, "textarea")}
          ${fieldInput("uni-city-life", t("admin_field_city_life"), u.city_life, "textarea")}
          ${fieldInput("uni-rota-note", t("admin_field_rota_note"), u.rota_note, "textarea")}
          ${fieldInput("uni-active", t("admin_field_active"), u.active, "checkbox")}
          <button type="submit" class="btn">${t("application_save")}</button>
          <span class="form-msg success" id="uni-save-msg"></span>
        </form>
      </div>
      ${
        u.id
          ? `<div class="card">
        <h2>${t("admin_programs_title")}</h2>
        ${state.editPrograms
          .map(
            (p, i) => `
          <form class="program-edit" data-program-index="${i}">
            <div class="row">
              ${fieldInput("p-name-" + i, t("admin_field_name"), p.name)}
              ${fieldInput("p-faculty-" + i, t("admin_field_faculty"), p.faculty)}
            </div>
            <div class="row">
              <div class="field">
                <label>${t("admin_field_degree")}</label>
                <select id="p-degree-${i}">
                  <option value="bachelor" ${p.degree === "bachelor" ? "selected" : ""}>${t("degree_bachelor")}</option>
                  <option value="master" ${p.degree === "master" ? "selected" : ""}>${t("degree_master")}</option>
                  <option value="phd" ${p.degree === "phd" ? "selected" : ""}>${t("degree_phd")}</option>
                </select>
              </div>
              ${fieldInput("p-lang-" + i, t("uni_languages"), p.language)}
              ${fieldInput("p-years-" + i, t("admin_field_duration"), p.duration_years, "number")}
            </div>
            ${fieldInput("p-tuition-" + i, t("admin_field_tuition"), p.tuition_note)}
            ${fieldInput("p-desc-" + i, t("admin_field_description"), p.description, "textarea")}
            ${fieldInput("p-entry-" + i, t("admin_field_entry"), p.entry_requirements, "textarea")}
            ${fieldInput("p-career-" + i, t("admin_field_career"), p.career_note, "textarea")}
            ${fieldInput("p-active-" + i, t("admin_field_active"), p.active, "checkbox")}
            <button type="submit" class="btn btn-sm">${t("application_save")}</button>
            <button type="button" class="btn btn-danger btn-sm" data-del-program="${i}">${t("admin_delete_program")}</button>
            <span class="form-msg success" id="p-msg-${i}"></span>
          </form>`
          )
          .join("")}
        <button type="button" class="btn btn-secondary spaced-top" id="add-program-btn">${t("admin_program_add")}</button>
      </div>`
          : ""
      }`;
    bindAdminNav();
    document.getElementById("back-unis").addEventListener("click", async () => {
      state.view = "list";
      state.tab = "unis";
      await loadUniversities();
      render();
    });
    document.getElementById("uni-name").addEventListener("input", (e) => {
      const slug = document.getElementById("uni-slug");
      if (!u.id || !slug.value) slug.value = slugify(e.target.value);
    });
    document.getElementById("uni-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById("uni-name").value.trim(),
        slug: document.getElementById("uni-slug").value.trim() || slugify(document.getElementById("uni-name").value),
        city: document.getElementById("uni-city").value.trim() || null,
        kind: document.getElementById("uni-kind").value,
        founded_year: document.getElementById("uni-founded").value ? Number(document.getElementById("uni-founded").value) : null,
        website: document.getElementById("uni-website").value.trim() || null,
        instruction_languages: document.getElementById("uni-languages").value.trim() || null,
        student_count: document.getElementById("uni-students").value.trim() || null,
        tuition_range: document.getElementById("uni-tuition").value.trim() || null,
        housing: document.getElementById("uni-housing").value.trim() || null,
        about: document.getElementById("uni-about").value.trim() || null,
        admission_requirements: document.getElementById("uni-admission").value.trim() || null,
        city_life: document.getElementById("uni-city-life").value.trim() || null,
        rota_note: document.getElementById("uni-rota-note").value.trim() || null,
        active: document.getElementById("uni-active").checked,
      };
      const msg = document.getElementById("uni-save-msg");
      let error;
      if (u.id) {
        ({ error } = await sb().from("universities").update(payload).eq("id", u.id));
      } else {
        const { data, error: insErr } = await sb().from("universities").insert(payload).select().single();
        error = insErr;
        if (!error) state.editUniversity = { ...data, programs: [] };
      }
      msg.textContent = error ? error.message : t("admin_university_saved");
      msg.className = error ? "form-msg error" : "form-msg success";
      if (!error && !u.id) {
        state.view = "uni-edit";
        render();
      }
    });
    document.getElementById("add-program-btn")?.addEventListener("click", async () => {
      const { data, error } = await sb()
        .from("programs")
        .insert({ university_id: state.editUniversity.id, name: t("admin_program_add"), degree: "bachelor" })
        .select()
        .single();
      if (error) return alert(error.message);
      state.editPrograms.push(data);
      render();
    });
    document.querySelectorAll(".program-edit").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const i = Number(form.getAttribute("data-program-index"));
        const p = state.editPrograms[i];
        const payload = {
          name: document.getElementById("p-name-" + i).value.trim(),
          faculty: document.getElementById("p-faculty-" + i).value.trim() || null,
          degree: document.getElementById("p-degree-" + i).value,
          language: document.getElementById("p-lang-" + i).value.trim() || null,
          duration_years: document.getElementById("p-years-" + i).value ? Number(document.getElementById("p-years-" + i).value) : null,
          tuition_note: document.getElementById("p-tuition-" + i).value.trim() || null,
          description: document.getElementById("p-desc-" + i).value.trim() || null,
          entry_requirements: document.getElementById("p-entry-" + i).value.trim() || null,
          career_note: document.getElementById("p-career-" + i).value.trim() || null,
          active: document.getElementById("p-active-" + i).checked,
        };
        const { error } = await sb().from("programs").update(payload).eq("id", p.id);
        const msg = document.getElementById("p-msg-" + i);
        msg.textContent = error ? error.message : t("admin_program_saved");
        msg.className = error ? "form-msg error" : "form-msg success";
        if (!error) Object.assign(p, payload);
      });
    });
    document.querySelectorAll("[data-del-program]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(t("admin_confirm_delete_program"))) return;
        const i = Number(btn.getAttribute("data-del-program"));
        const p = state.editPrograms[i];
        const { error } = await sb().from("programs").delete().eq("id", p.id);
        if (error) return alert(error.message);
        state.editPrograms.splice(i, 1);
        render();
      });
    });
  }

  function statusBadge_forApp(status) {
    const cls = { pre_registration: "badge-missing", documents_pending: "badge-pending", under_review: "badge-pending", accepted: "badge-approved", completed: "badge-approved" }[status];
    return `<span class="badge ${cls}">${t(STATUS_LABEL_KEY[status])}</span>`;
  }

  function attachListHandlers() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderList();
    });
    document.getElementById("year-filter").addEventListener("change", (e) => {
      state.filterYear = e.target.value;
      renderList();
    });
    document.getElementById("status-filter").addEventListener("change", (e) => {
      state.filterStatus = e.target.value;
      renderList();
    });
    document.querySelectorAll("[data-open-app]").forEach((row) => {
      row.addEventListener("click", async () => {
        state.selectedId = row.getAttribute("data-open-app");
        state.view = "detail";
        await loadDetail(state.selectedId);
        render();
      });
    });
    document.getElementById("add-doctype-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const labelTr = document.getElementById("new-doctype-tr").value.trim();
      const labelEn = document.getElementById("new-doctype-en").value.trim();
      if (!labelTr || !labelEn) return;
      const labelAr = document.getElementById("new-doctype-ar").value.trim() || labelEn;
      const labelFa = document.getElementById("new-doctype-fa").value.trim() || labelEn;
      const labelRu = document.getElementById("new-doctype-ru").value.trim() || labelEn;
      const slug = labelEn
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const key = `${slug || "belge"}-${Date.now().toString(36)}`;
      const { error } = await sb().from("document_types").insert({
        key,
        label_tr: labelTr,
        label_en: labelEn,
        label_ar: labelAr,
        label_fa: labelFa,
        label_ru: labelRu,
        sort_order: state.documentTypesAll.length + 1,
      });
      if (error) return alert(error.message);
      await loadDocumentTypesAll();
      renderList();
    });
    document.querySelectorAll("[data-toggle-doctype]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-toggle-doctype");
        const active = btn.getAttribute("data-active") === "true";
        const { error } = await sb().from("document_types").update({ active: !active }).eq("id", id);
        if (error) return alert(error.message);
        await loadDocumentTypesAll();
        renderList();
      });
    });
    document.querySelectorAll("[data-edit-doctype]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.editingDocTypeId = btn.getAttribute("data-edit-doctype");
        renderList();
      });
    });
    document.querySelectorAll("[data-cancel-edit-doctype]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.editingDocTypeId = null;
        renderList();
      });
    });
    document.querySelectorAll("[data-edit-doctype-form]").forEach((form) => {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = form.getAttribute("data-edit-doctype-form");
        const labelTr = form.label_tr.value.trim();
        const labelEn = form.label_en.value.trim();
        if (!labelTr || !labelEn) return;
        const labelAr = form.label_ar.value.trim() || labelEn;
        const labelFa = form.label_fa.value.trim() || labelEn;
        const labelRu = form.label_ru.value.trim() || labelEn;
        const { error } = await sb()
          .from("document_types")
          .update({
            label_tr: labelTr,
            label_en: labelEn,
            label_ar: labelAr,
            label_fa: labelFa,
            label_ru: labelRu,
          })
          .eq("id", id);
        if (error) return alert(error.message);
        state.editingDocTypeId = null;
        await loadDocumentTypesAll();
        renderList();
      });
    });
    document.querySelectorAll("[data-delete-doctype]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (btn.disabled) return;
        const id = btn.getAttribute("data-delete-doctype");
        const used = Number(btn.getAttribute("data-used") || 0);
        if (used > 0) return alert(t("admin_document_type_delete_in_use"));
        if (!confirm(t("admin_document_type_delete_confirm"))) return;
        const { error } = await sb().from("document_types").delete().eq("id", id);
        if (error) return alert(error.message);
        if (state.editingDocTypeId === id) state.editingDocTypeId = null;
        await loadDocumentTypesAll();
        renderList();
      });
    });
  }

  // -------------------------------------------------------------- DETAIL --
  function renderStepperAdmin(status) {
    const idx = STATUS_ORDER.indexOf(status);
    return `<ul class="stepper">${STATUS_ORDER.map((s, i) => {
      const cls = i < idx ? "done" : i === idx ? "current" : "";
      return `<li class="${cls}">${t(STATUS_LABEL_KEY[s])}</li>`;
    }).join("")}</ul>`;
  }

  function renderDetailDocRow(dt, doc) {
    const status = doc ? doc.status : "missing";
    return `
      <li class="doc-item">
        <div class="doc-item-main">
          <span class="doc-item-name">${window.rotaI18n.docTypeLabel(dt)}</span>
          ${statusBadge(status)}
          ${status === "rejected" && doc.review_note ? `<span class="doc-item-note">${t("document_review_note")}: ${doc.review_note}</span>` : ""}
        </div>
        <div class="doc-item-actions">
          ${doc ? `<button type="button" class="btn btn-secondary btn-sm" data-view-doc="${doc.id}">${t("document_view")}</button>` : `<span class="muted">${t("document_status_missing")}</span>`}
          ${
            doc
              ? `<button type="button" class="btn btn-sm" data-approve-doc="${doc.id}">${t("admin_approve")}</button>
                 <button type="button" class="btn btn-danger btn-sm" data-reject-doc="${doc.id}">${t("admin_reject")}</button>`
              : ""
          }
        </div>
      </li>`;
  }

  function renderDetail() {
    const { application, documents } = state.detail;
    const docsByType = {};
    documents.forEach((d) => (docsByType[d.document_type_id] = d));
    const relevantTypes = state.documentTypesAll.filter((dt) => dt.active || docsByType[dt.id]);
    const profile = application.profile || {};

    const app = document.getElementById("app");
    app.innerHTML = `
      <button type="button" class="link-btn" id="back-to-list">&larr; ${t("admin_back_to_list")}</button>
      <div class="card spaced-top">
        ${renderStepperAdmin(application.status)}
        <div class="row spaced-top">
          <div>
            <strong>${profile.full_name || "—"}</strong><br/>
            <span class="muted">${profile.email || ""}</span><br/>
            <span class="muted">${profile.phone || ""}</span><br/>
            <span class="muted">${profile.nationality || ""}</span>
            <p class="spaced-top">${application.target_university || "—"} · ${application.target_program || "—"}</p>
          </div>
          <div>
            <div class="field">
              <label>${t("admin_advance_status")}</label>
              <select id="status-select">
                ${STATUS_ORDER.map((s) => `<option value="${s}" ${application.status === s ? "selected" : ""}>${t(STATUS_LABEL_KEY[s])}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
        <div class="field spaced-top">
          <label>${t("admin_notes")}</label>
          <textarea id="admin-notes" rows="3">${application.notes || ""}</textarea>
        </div>
        <button type="button" class="btn" id="save-detail-btn">${t("application_save")}</button>
        <span class="form-msg success" id="detail-save-msg"></span>
      </div>

      <div class="card">
        <h2>${t("documents_title")}</h2>
        <ul class="doc-list">${relevantTypes.map((dt) => renderDetailDocRow(dt, docsByType[dt.id])).join("")}</ul>
      </div>

      <div class="card">
        <h2>${t("acceptance_letter_title")}</h2>
        ${
          application.acceptance_letter_path
            ? `<button type="button" class="btn btn-secondary" id="view-letter-btn">${t("document_view")}</button>`
            : `<p class="muted">${t("acceptance_letter_none")}</p>`
        }
        <label class="btn spaced-top" style="display:inline-flex">
          ${t("admin_upload_acceptance_letter")}
          <input type="file" id="acceptance-letter-input" style="display:none" />
        </label>
      </div>
    `;
    attachDetailHandlers();
  }

  function attachDetailHandlers() {
    const { application } = state.detail;

    document.getElementById("back-to-list").addEventListener("click", async () => {
      state.view = "list";
      await loadApplications();
      render();
    });

    document.getElementById("save-detail-btn").addEventListener("click", async () => {
      const status = document.getElementById("status-select").value;
      const notes = document.getElementById("admin-notes").value;
      const { error } = await sb().from("applications").update({ status, notes }).eq("id", application.id);
      const msg = document.getElementById("detail-save-msg");
      msg.textContent = error ? error.message : t("application_saved");
      msg.className = error ? "form-msg error" : "form-msg success";
      if (!error) await loadDetail(application.id);
    });

    document.querySelectorAll("[data-view-doc]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const doc = state.detail.documents.find((d) => d.id === btn.getAttribute("data-view-doc"));
        if (!doc) return;
        await openSignedUrl(doc.storage_path);
      });
    });

    document.querySelectorAll("[data-approve-doc]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-approve-doc");
        const { error } = await sb().from("documents").update({ status: "approved", review_note: null }).eq("id", id);
        if (error) return alert(error.message);
        await loadDetail(application.id);
        renderDetail();
      });
    });

    document.querySelectorAll("[data-reject-doc]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const note = prompt(t("admin_reject_note_prompt"));
        if (note === null) return;
        const id = btn.getAttribute("data-reject-doc");
        const { error } = await sb().from("documents").update({ status: "rejected", review_note: note }).eq("id", id);
        if (error) return alert(error.message);
        await loadDetail(application.id);
        renderDetail();
      });
    });

    const letterBtn = document.getElementById("view-letter-btn");
    if (letterBtn) {
      letterBtn.addEventListener("click", async () => {
        await openSignedUrl(application.acceptance_letter_path);
      });
    }

    document.getElementById("acceptance-letter-input").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const path = `${application.student_id}/acceptance-letter-${Date.now()}-${file.name}`;
      const { error: upErr } = await sb().storage.from("documents").upload(path, file);
      if (upErr) return alert(upErr.message);
      const previous = application.acceptance_letter_path;
      const nextStatus = ["accepted", "completed"].includes(application.status) ? application.status : "accepted";
      const { error: dbErr } = await sb()
        .from("applications")
        .update({ acceptance_letter_path: path, status: nextStatus })
        .eq("id", application.id);
      if (dbErr) return alert(dbErr.message);
      if (previous) await sb().storage.from("documents").remove([previous]);
      await loadDetail(application.id);
      renderDetail();
    });
  }

  // --------------------------------------------------------------- MAIN --
  function render() {
    window.rotaAuth.renderRoleBadge(state.profile);
    if (state.view === "detail" && state.detail) {
      renderDetail();
    } else if (state.view === "uni-edit" && state.editUniversity) {
      renderUniversityEdit();
    } else if (state.tab === "unis") {
      renderUniversityList();
    } else {
      renderList();
    }
  }
  window.render = render;

  (async function init() {
    const auth = await window.rotaAuth.requireRole("admin");
    if (!auth) return;
    state.profile = auth.profile;
    try {
      await Promise.all([loadApplications(), loadDocumentTypesAll()]);
      render();
    } catch (err) {
      document.getElementById("app").innerHTML = `<p class="empty-state">${err.message}</p>`;
    }
  })();
})();
