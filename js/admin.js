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
    filterStatus: "",
    search: "",
    selectedId: null,
    detail: null,
  };

  async function loadApplications() {
    const { data, error } = await sb()
      .from("applications")
      .select("*, profile:profiles!applications_student_id_fkey(full_name, email, nationality)")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    state.applications = data || [];
  }

  async function loadDocumentTypesAll() {
    const { data, error } = await sb().from("document_types").select("*").order("sort_order");
    if (error) throw error;
    state.documentTypesAll = data || [];
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
  function filteredApplications() {
    const q = state.search.trim().toLowerCase();
    return state.applications.filter((a) => {
      if (state.filterStatus && a.status !== state.filterStatus) return false;
      if (!q) return true;
      const hay = `${a.profile?.full_name || ""} ${a.profile?.email || ""} ${a.profile?.nationality || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderDocTypeManager() {
    return `
      <div class="card">
        <h2>${t("admin_document_types_title")}</h2>
        ${state.documentTypesAll
          .map(
            (dt) => `
          <div class="doctype-row ${dt.active ? "" : "inactive"}">
            <span>${dt.label_tr} / ${dt.label_en}</span>
            <button type="button" class="btn btn-secondary btn-sm" data-toggle-doctype="${dt.id}" data-active="${dt.active}">
              ${dt.active ? t("admin_document_type_deactivate") : t("admin_document_type_activate")}
            </button>
          </div>`
          )
          .join("")}
        <form class="inline-form" id="add-doctype-form">
          <input type="text" id="new-doctype-label" data-i18n-placeholder="admin_document_type_new_placeholder" placeholder="${t(
            "admin_document_type_new_placeholder"
          )}" required />
          <button type="submit" class="btn btn-sm">${t("admin_document_type_add")}</button>
        </form>
      </div>`;
  }

  function renderList() {
    const rows = filteredApplications();
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card">
        <h2>${t("admin_title")}</h2>
        <div class="table-toolbar">
          <input type="text" id="search-input" data-i18n-placeholder="admin_search_placeholder" placeholder="${t(
            "admin_search_placeholder"
          )}" value="${state.search}" />
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
                    <th>${t("admin_table_nationality")}</th>
                    <th>${t("admin_table_status")}</th>
                    <th>${t("admin_table_updated")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (a) => `
                    <tr data-open-app="${a.id}">
                      <td>${a.profile?.full_name || "—"}<br/><span class="muted">${a.profile?.email || ""}</span></td>
                      <td>${a.profile?.nationality || "—"}</td>
                      <td>${statusBadge_forApp(a.status)}</td>
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
    attachListHandlers();
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
      const label = document.getElementById("new-doctype-label").value.trim();
      if (!label) return;
      const slug = label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const key = `${slug || "belge"}-${Date.now().toString(36)}`;
      const { error } = await sb()
        .from("document_types")
        .insert({ key, label_tr: label, label_en: label, sort_order: state.documentTypesAll.length + 1 });
      if (error) return alert(error.message);
      await loadDocumentTypesAll();
      renderList();
    });
    document.querySelectorAll("[data-toggle-doctype]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-toggle-doctype");
        const active = btn.getAttribute("data-active") === "true";
        const { error } = await sb().from("document_types").update({ active: !active }).eq("id", id);
        if (error) return alert(error.message);
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
