(function () {
  const sb = () => window.rotaSupabase;
  const t = (k) => window.rotaI18n.t(k);
  const STATUS_ORDER = ["pre_registration", "documents_pending", "under_review", "accepted", "completed"];

  const state = { userId: null, profile: null, application: null, documentTypes: [], documentsByType: {}, universities: [] };

  async function loadAll() {
    let { data: application } = await sb()
      .from("applications")
      .select("*")
      .eq("student_id", state.userId)
      .maybeSingle();

    if (!application) {
      const { data: created, error } = await sb()
        .from("applications")
        .insert({ student_id: state.userId })
        .select()
        .single();
      if (error) throw error;
      application = created;
    }
    state.application = application;

    const { data: documentTypes } = await sb()
      .from("document_types")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    state.documentTypes = documentTypes || [];

    const { data: documents } = await sb()
      .from("documents")
      .select("*")
      .eq("application_id", application.id);
    state.documentsByType = {};
    (documents || []).forEach((d) => (state.documentsByType[d.document_type_id] = d));

    try {
      state.universities = await window.rotaCatalog.loadCatalog();
    } catch {
      state.universities = [];
    }

    const pref = window.rotaCatalog.loadApplyPref();
    if (pref && (pref.universityId || pref.universityName)) {
      const patch = {
        university_id: pref.universityId || state.application.university_id,
        program_id: pref.programId || state.application.program_id,
        target_university: pref.universityName || state.application.target_university,
        target_program: pref.programName || state.application.target_program,
      };
      const { error } = await sb().from("applications").update(patch).eq("id", state.application.id);
      if (!error) {
        Object.assign(state.application, patch);
        sessionStorage.removeItem("rota_apply_pref");
      }
    }
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

  function renderStepper() {
    const idx = STATUS_ORDER.indexOf(state.application.status);
    const labels = ["step_pre_registration", "step_documents_pending", "step_under_review", "step_accepted", "step_completed"];
    return `<ul class="stepper">${labels
      .map((key, i) => {
        const cls = i < idx ? "done" : i === idx ? "current" : "";
        return `<li class="${cls}">${t(key)}</li>`;
      })
      .join("")}</ul>`;
  }

  function renderDocumentRow(dt) {
    const doc = state.documentsByType[dt.id];
    const status = doc ? doc.status : "missing";
    const label = window.rotaI18n.docTypeLabel(dt);
    const uploadLabel = doc ? t("document_replace") : t("document_upload");
    return `
      <li class="doc-item">
        <div class="doc-item-main">
          <span class="doc-item-name">${label}${dt.required ? "" : " " + t("document_optional_label")}</span>
          ${statusBadge(status)}
          ${status === "rejected" && doc.review_note ? `<span class="doc-item-note">${t("document_review_note")}: ${doc.review_note}</span>` : ""}
        </div>
        <div class="doc-item-actions">
          ${doc ? `<button type="button" class="btn btn-secondary btn-sm" data-view-doc="${doc.id}">${t("document_view")}</button>` : ""}
          <label class="btn btn-sm">
            ${uploadLabel}
            <input type="file" data-upload-doctype="${dt.id}" style="display:none" />
          </label>
          ${doc ? `<button type="button" class="btn btn-danger btn-sm" data-delete-doc="${doc.id}">${t("document_delete")}</button>` : ""}
        </div>
      </li>`;
  }

  function renderAcceptanceLetter() {
    if (!["accepted", "completed"].includes(state.application.status)) return "";
    return `
      <div class="card">
        <h2>${t("acceptance_letter_title")}</h2>
        ${
          state.application.acceptance_letter_path
            ? `<button type="button" class="btn" id="download-letter-btn">${t("acceptance_letter_download")}</button>`
            : `<p class="muted">${t("acceptance_letter_none")}</p>`
        }
      </div>`;
  }

  function selectedUniversity() {
    return state.universities.find((u) => u.id === state.application.university_id) || null;
  }

  function programOptionsHtml() {
    const uni = selectedUniversity();
    const programs = uni ? uni.programs : [];
    const current = state.application.program_id;
    return `<option value="">${t("application_choose_placeholder")}</option>${programs
      .map((p) => `<option value="${p.id}" ${p.id === current ? "selected" : ""}>${window.rotaCatalog.escapeHtml(p.name)}</option>`)
      .join("")}`;
  }

  function render() {
    window.rotaAuth.renderRoleBadge(state.profile);
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="card">
        ${renderStepper()}
      </div>
      <div class="card">
        <h2>${t("application_title")}</h2>
        <form id="application-form">
          <div class="field">
            <label>${t("application_choose_university")}</label>
            <select id="university-id">
              <option value="">${t("application_choose_placeholder")}</option>
              ${state.universities
                .map(
                  (u) =>
                    `<option value="${u.id}" ${u.id === state.application.university_id ? "selected" : ""}>${window.rotaCatalog.escapeHtml(u.name)}${
                      u.city ? " — " + window.rotaCatalog.escapeHtml(u.city) : ""
                    }</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="field">
            <label>${t("application_choose_program")}</label>
            <select id="program-id">${programOptionsHtml()}</select>
          </div>
          <button type="submit" class="btn">${t("application_save")}</button>
          <span class="form-msg success" id="application-save-msg"></span>
        </form>
      </div>
      <div class="card">
        <h2>${t("documents_title")}</h2>
        <ul class="doc-list">
          ${state.documentTypes.map(renderDocumentRow).join("")}
        </ul>
      </div>
      ${renderAcceptanceLetter()}
    `;
    attachHandlers();
  }

  function attachHandlers() {
    document.getElementById("university-id").addEventListener("change", () => {
      state.application.university_id = document.getElementById("university-id").value || null;
      state.application.program_id = null;
      document.getElementById("program-id").innerHTML = programOptionsHtml();
    });

    document.getElementById("application-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const university_id = document.getElementById("university-id").value || null;
      const program_id = document.getElementById("program-id").value || null;
      const uni = state.universities.find((u) => u.id === university_id);
      const program = uni?.programs.find((p) => p.id === program_id);
      const target_university = uni?.name || "";
      const target_program = program?.name || "";
      const { error } = await sb()
        .from("applications")
        .update({ university_id, program_id, target_program, target_university })
        .eq("id", state.application.id);
      const msg = document.getElementById("application-save-msg");
      msg.textContent = error ? error.message : t("application_saved");
      msg.className = error ? "form-msg error" : "form-msg success";
      if (!error) {
        Object.assign(state.application, { university_id, program_id, target_program, target_university });
      }
    });

    document.querySelectorAll("[data-upload-doctype]").forEach((input) => {
      input.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const docTypeId = e.target.getAttribute("data-upload-doctype");
        const dt = state.documentTypes.find((d) => d.id === docTypeId);
        try {
          await uploadDocument(dt, file);
        } catch (err) {
          alert(err.message || t("auth_error_generic"));
        }
      });
    });

    document.querySelectorAll("[data-view-doc]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const docId = btn.getAttribute("data-view-doc");
        const doc = Object.values(state.documentsByType).find((d) => d.id === docId);
        if (!doc) return;
        await openSignedUrl(doc.storage_path);
      });
    });

    document.querySelectorAll("[data-delete-doc]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(t("document_delete_confirm"))) return;
        const docId = btn.getAttribute("data-delete-doc");
        const doc = Object.values(state.documentsByType).find((d) => d.id === docId);
        if (!doc) return;
        try {
          await deleteDocument(doc);
        } catch (err) {
          alert(err.message || t("auth_error_generic"));
        }
      });
    });

    const letterBtn = document.getElementById("download-letter-btn");
    if (letterBtn) {
      letterBtn.addEventListener("click", async () => {
        await openSignedUrl(state.application.acceptance_letter_path);
      });
    }
  }

  // Yeni sekme açmak (window.open) yerine mevcut sekmede yönlendirir —
  // tarayıcılar arasında pop-up engelleyici davranışı tutarsız olduğundan
  // (Chrome/Firefox farklı davranıyor) en güvenilir yöntem bu.
  async function openSignedUrl(storagePath) {
    const { data, error } = await sb().storage.from("documents").createSignedUrl(storagePath, 600);
    if (error) return alert(error.message);
    window.location.href = data.signedUrl;
  }

  async function deleteDocument(doc) {
    const { error: dbErr } = await sb().from("documents").delete().eq("id", doc.id);
    if (dbErr) throw dbErr;
    if (doc.storage_path) {
      await sb().storage.from("documents").remove([doc.storage_path]);
    }
    await loadAll();
    render();
  }

  async function uploadDocument(dt, file) {
    const previous = state.documentsByType[dt.id];
    const path = `${state.userId}/${dt.key}-${Date.now()}-${file.name}`;
    const { error: upErr } = await sb().storage.from("documents").upload(path, file);
    if (upErr) throw upErr;

    const { error: dbErr } = await sb()
      .from("documents")
      .upsert(
        { application_id: state.application.id, document_type_id: dt.id, storage_path: path },
        { onConflict: "application_id,document_type_id" }
      );
    if (dbErr) throw dbErr;

    if (previous) {
      await sb().storage.from("documents").remove([previous.storage_path]);
    }

    if (state.application.status === "pre_registration") {
      await sb().from("applications").update({ status: "documents_pending" }).eq("id", state.application.id);
    }

    await loadAll();
    render();
  }

  window.render = render;

  (async function init() {
    const auth = await window.rotaAuth.requireRole("student");
    if (!auth) return;
    state.userId = auth.session.user.id;
    state.profile = auth.profile;
    try {
      await loadAll();
      render();
    } catch (err) {
      document.getElementById("app").innerHTML = `<p class="empty-state">${err.message}</p>`;
    }
  })();
})();
