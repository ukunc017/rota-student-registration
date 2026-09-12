// Basit TR/EN sözlük + yardımcılar. Kullanım: t('key') veya data-i18n="key" attribute'u ile.
window.ROTA_I18N = {
  tr: {
    app_name: "Rota Education Consultancy",
    nav_logout: "Çıkış Yap",

    login_title: "Giriş Yap",
    login_subtitle: "Başvurunuzu takip etmek için giriş yapın",
    login_email: "E-posta",
    login_password: "Şifre",
    login_submit: "Giriş Yap",
    login_switch_to_register: "Hesabınız yok mu? Kayıt olun",
    register_title: "Kayıt Ol",
    register_full_name: "Ad Soyad",
    register_phone: "Telefon",
    register_nationality: "Uyruk",
    register_submit: "Kayıt Ol",
    register_switch_to_login: "Zaten hesabınız var mı? Giriş yapın",
    auth_error_generic: "Bir hata oluştu, lütfen tekrar deneyin.",
    auth_admin_notice: "Yönetici hesabıyla giriş yapıyorsanız aynı formu kullanabilirsiniz.",

    step_pre_registration: "Ön Kayıt",
    step_documents_pending: "Evrak Yükleme",
    step_under_review: "İnceleme",
    step_accepted: "Kabul Mektubu",
    step_completed: "Kayıt Tamamlandı",

    application_title: "Başvuru Bilgileri",
    application_target_program: "Hedef Program / Bölüm",
    application_target_university: "Hedef Üniversite",
    application_save: "Kaydet",
    application_saved: "Kaydedildi",

    documents_title: "Evraklar",
    document_status_missing: "Yüklenmedi",
    document_status_pending: "İnceleniyor",
    document_status_approved: "Onaylandı",
    document_status_rejected: "Reddedildi",
    document_upload: "Yükle",
    document_replace: "Yeniden Yükle",
    document_view: "Görüntüle",
    document_review_note: "Not",

    acceptance_letter_title: "Kabul Mektubu",
    acceptance_letter_none: "Henüz yüklenmedi",
    acceptance_letter_download: "İndir",

    admin_title: "Başvuru Yönetimi",
    admin_search_placeholder: "İsim, e-posta veya ülke ara...",
    admin_filter_all_status: "Tüm Durumlar",
    admin_table_name: "Ad Soyad",
    admin_table_nationality: "Uyruk",
    admin_table_status: "Durum",
    admin_table_updated: "Güncelleme",
    admin_no_results: "Sonuç bulunamadı",
    admin_back_to_list: "Listeye Dön",
    admin_advance_status: "Durumu İlerlet",
    admin_upload_acceptance_letter: "Kabul Mektubu Yükle",
    admin_approve: "Onayla",
    admin_reject: "Reddet",
    admin_reject_note_prompt: "Red nedeni (öğrenciye gösterilecek):",
    admin_document_types_title: "Evrak Türleri",
    admin_document_type_new_placeholder: "Yeni evrak türü adı (TR)",
    admin_document_type_add: "Ekle",
    admin_document_type_deactivate: "Pasifleştir",
    admin_document_type_activate: "Aktifleştir",
    admin_notes: "Notlar",

    doctype_passport: "Pasaport",
    doctype_diploma_transcript: "Diploma / Transkript",
    doctype_photo: "Vesikalık Fotoğraf",
    doctype_language_certificate: "Dil Sertifikası",

    loading: "Yükleniyor...",
    not_authorized: "Bu sayfayı görüntüleme yetkiniz yok.",
  },
  en: {
    app_name: "Rota Education Consultancy",
    nav_logout: "Log Out",

    login_title: "Sign In",
    login_subtitle: "Sign in to track your application",
    login_email: "Email",
    login_password: "Password",
    login_submit: "Sign In",
    login_switch_to_register: "Don't have an account? Register",
    register_title: "Register",
    register_full_name: "Full Name",
    register_phone: "Phone",
    register_nationality: "Nationality",
    register_submit: "Register",
    register_switch_to_login: "Already have an account? Sign in",
    auth_error_generic: "Something went wrong, please try again.",
    auth_admin_notice: "Admins can sign in using the same form.",

    step_pre_registration: "Pre-Registration",
    step_documents_pending: "Document Upload",
    step_under_review: "Under Review",
    step_accepted: "Acceptance Letter",
    step_completed: "Registration Complete",

    application_title: "Application Details",
    application_target_program: "Target Program / Major",
    application_target_university: "Target University",
    application_save: "Save",
    application_saved: "Saved",

    documents_title: "Documents",
    document_status_missing: "Not uploaded",
    document_status_pending: "Under review",
    document_status_approved: "Approved",
    document_status_rejected: "Rejected",
    document_upload: "Upload",
    document_replace: "Replace",
    document_view: "View",
    document_review_note: "Note",

    acceptance_letter_title: "Acceptance Letter",
    acceptance_letter_none: "Not uploaded yet",
    acceptance_letter_download: "Download",

    admin_title: "Application Management",
    admin_search_placeholder: "Search name, email or country...",
    admin_filter_all_status: "All Statuses",
    admin_table_name: "Full Name",
    admin_table_nationality: "Nationality",
    admin_table_status: "Status",
    admin_table_updated: "Updated",
    admin_no_results: "No results found",
    admin_back_to_list: "Back to List",
    admin_advance_status: "Advance Status",
    admin_upload_acceptance_letter: "Upload Acceptance Letter",
    admin_approve: "Approve",
    admin_reject: "Reject",
    admin_reject_note_prompt: "Rejection reason (shown to student):",
    admin_document_types_title: "Document Types",
    admin_document_type_new_placeholder: "New document type name (EN)",
    admin_document_type_add: "Add",
    admin_document_type_deactivate: "Deactivate",
    admin_document_type_activate: "Activate",
    admin_notes: "Notes",

    doctype_passport: "Passport",
    doctype_diploma_transcript: "Diploma / Transcript",
    doctype_photo: "Photo",
    doctype_language_certificate: "Language Certificate",

    loading: "Loading...",
    not_authorized: "You are not authorized to view this page.",
  },
};

(function () {
  function getLang() {
    return localStorage.getItem("rota_lang") || "tr";
  }
  function setLang(lang) {
    localStorage.setItem("rota_lang", lang);
    applyI18n();
  }
  function t(key) {
    const lang = getLang();
    const dict = window.ROTA_I18N[lang] || window.ROTA_I18N.tr;
    return dict[key] || window.ROTA_I18N.tr[key] || key;
  }
  function applyI18n() {
    document.documentElement.lang = getLang();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-lang-btn") === getLang());
    });
  }
  window.rotaI18n = { t, getLang, setLang, applyI18n };
  document.addEventListener("DOMContentLoaded", applyI18n);
})();
