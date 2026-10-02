// Basit çok dilli sözlük + yardımcılar. Kullanım: t('key') veya data-i18n="key" attribute'u ile.
window.ROTA_I18N = {
  tr: {
    app_name: "Rota Education Consultancy",
    nav_logout: "Çıkış Yap",
    nav_logout_confirm: "Oturumu kapatmak istediğinize emin misiniz?",
    role_admin: "Admin",
    role_student: "Öğrenci",

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
    register_check_email: "E-postanızı kontrol edip hesabınızı onaylayın, ardından giriş yapın.",

    profile_title: "Hesap Bilgileri",
    profile_full_name: "Ad Soyad",
    profile_email: "E-posta",
    profile_role: "Rol",

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
    document_delete: "Sil",
    document_delete_confirm: "Bu evrak silinsin mi?",
    document_optional_label: "(opsiyonel)",
    document_view: "Görüntüle",
    document_review_note: "Not",

    acceptance_letter_title: "Kabul Mektubu",
    acceptance_letter_none: "Henüz yüklenmedi",
    acceptance_letter_download: "İndir",

    admin_title: "Başvuru Yönetimi",
    admin_search_placeholder: "İsim, e-posta veya ülke ara...",
    admin_filter_all_status: "Tüm Durumlar",
    admin_filter_all_years: "Tüm Yıllar",
    admin_filter_year: "Kayıt yılı",
    admin_table_name: "Ad Soyad",
    admin_table_nationality: "Uyruk",
    admin_table_status: "Durum",
    admin_table_registered: "Kayıt tarihi",
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
    admin_document_type_optional_hint: "Boş bırakılırsa İngilizce kullanılır.",
    admin_document_type_add: "Ekle",
    admin_document_type_edit: "Düzenle",
    admin_document_type_save: "Kaydet",
    admin_document_type_cancel: "İptal",
    admin_document_type_delete: "Sil",
    admin_document_type_delete_confirm: "Bu evrak türü silinsin mi?",
    admin_document_type_delete_in_use: "Bu tür kullanıldığı için silinemez. Önce pasifleştirin.",
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
    nav_logout_confirm: "Are you sure you want to log out?",
    role_admin: "Admin",
    role_student: "Student",

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
    register_check_email: "Please check your email to confirm your account, then sign in.",

    profile_title: "Account Details",
    profile_full_name: "Full Name",
    profile_email: "Email",
    profile_role: "Role",

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
    document_delete: "Delete",
    document_delete_confirm: "Delete this document?",
    document_optional_label: "(optional)",
    document_view: "View",
    document_review_note: "Note",

    acceptance_letter_title: "Acceptance Letter",
    acceptance_letter_none: "Not uploaded yet",
    acceptance_letter_download: "Download",

    admin_title: "Application Management",
    admin_search_placeholder: "Search name, email or country...",
    admin_filter_all_status: "All Statuses",
    admin_filter_all_years: "All Years",
    admin_filter_year: "Registration year",
    admin_table_name: "Full Name",
    admin_table_nationality: "Nationality",
    admin_table_status: "Status",
    admin_table_registered: "Registered",
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
    admin_document_type_optional_hint: "Defaults to English if left blank.",
    admin_document_type_add: "Add",
    admin_document_type_edit: "Edit",
    admin_document_type_save: "Save",
    admin_document_type_cancel: "Cancel",
    admin_document_type_delete: "Delete",
    admin_document_type_delete_confirm: "Delete this document type?",
    admin_document_type_delete_in_use: "This type is in use and cannot be deleted. Deactivate it instead.",
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
  ar: {
    app_name: "Rota Education Consultancy",
    nav_logout: "تسجيل الخروج",
    nav_logout_confirm: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    role_admin: "المسؤول",
    role_student: "طالب",

    login_title: "تسجيل الدخول",
    login_subtitle: "سجّل الدخول لمتابعة طلبك",
    login_email: "البريد الإلكتروني",
    login_password: "كلمة المرور",
    login_submit: "تسجيل الدخول",
    login_switch_to_register: "ليس لديك حساب؟ سجّل الآن",
    register_title: "إنشاء حساب",
    register_full_name: "الاسم الكامل",
    register_phone: "رقم الهاتف",
    register_nationality: "الجنسية",
    register_submit: "تسجيل",
    register_switch_to_login: "لديك حساب بالفعل؟ سجّل الدخول",
    auth_error_generic: "حدث خطأ ما، يرجى المحاولة مرة أخرى.",
    auth_admin_notice: "يمكن للمسؤولين تسجيل الدخول باستخدام نفس النموذج.",
    register_check_email: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك، ثم تسجيل الدخول.",

    profile_title: "معلومات الحساب",
    profile_full_name: "الاسم الكامل",
    profile_email: "البريد الإلكتروني",
    profile_role: "الدور",

    step_pre_registration: "التسجيل المبدئي",
    step_documents_pending: "رفع المستندات",
    step_under_review: "قيد المراجعة",
    step_accepted: "خطاب القبول",
    step_completed: "اكتمل التسجيل",

    application_title: "تفاصيل الطلب",
    application_target_program: "التخصص / البرنامج المستهدف",
    application_target_university: "الجامعة المستهدفة",
    application_save: "حفظ",
    application_saved: "تم الحفظ",

    documents_title: "المستندات",
    document_status_missing: "لم يتم الرفع",
    document_status_pending: "قيد المراجعة",
    document_status_approved: "تمت الموافقة",
    document_status_rejected: "مرفوض",
    document_upload: "رفع",
    document_replace: "استبدال",
    document_delete: "حذف",
    document_delete_confirm: "هل تريد حذف هذا المستند؟",
    document_optional_label: "(اختياري)",
    document_view: "عرض",
    document_review_note: "ملاحظة",

    acceptance_letter_title: "خطاب القبول",
    acceptance_letter_none: "لم يتم الرفع بعد",
    acceptance_letter_download: "تحميل",

    admin_title: "إدارة الطلبات",
    admin_search_placeholder: "ابحث بالاسم أو البريد الإلكتروني أو الدولة...",
    admin_filter_all_status: "كل الحالات",
    admin_filter_all_years: "كل السنوات",
    admin_filter_year: "سنة التسجيل",
    admin_table_name: "الاسم الكامل",
    admin_table_nationality: "الجنسية",
    admin_table_status: "الحالة",
    admin_table_registered: "تاريخ التسجيل",
    admin_table_updated: "آخر تحديث",
    admin_no_results: "لا توجد نتائج",
    admin_back_to_list: "العودة إلى القائمة",
    admin_advance_status: "تحديث الحالة",
    admin_upload_acceptance_letter: "رفع خطاب القبول",
    admin_approve: "موافقة",
    admin_reject: "رفض",
    admin_reject_note_prompt: "سبب الرفض (سيظهر للطالب):",
    admin_document_types_title: "أنواع المستندات",
    admin_document_type_new_placeholder: "اسم نوع مستند جديد",
    admin_document_type_optional_hint: "إذا تُرك فارغًا، سيتم استخدام الإنجليزية.",
    admin_document_type_add: "إضافة",
    admin_document_type_edit: "تعديل",
    admin_document_type_save: "حفظ",
    admin_document_type_cancel: "إلغاء",
    admin_document_type_delete: "حذف",
    admin_document_type_delete_confirm: "هل تريد حذف نوع المستند هذا؟",
    admin_document_type_delete_in_use: "لا يمكن حذف هذا النوع لأنه مستخدم. قم بتعطيله بدلاً من ذلك.",
    admin_document_type_deactivate: "تعطيل",
    admin_document_type_activate: "تفعيل",
    admin_notes: "ملاحظات",

    doctype_passport: "جواز السفر",
    doctype_diploma_transcript: "الشهادة / كشف الدرجات",
    doctype_photo: "صورة شخصية",
    doctype_language_certificate: "شهادة اللغة",

    loading: "جارٍ التحميل...",
    not_authorized: "غير مصرح لك بعرض هذه الصفحة.",
  },
  fa: {
    app_name: "Rota Education Consultancy",
    nav_logout: "خروج",
    nav_logout_confirm: "آیا مطمئن هستید که می‌خواهید خارج شوید؟",
    role_admin: "مدیر",
    role_student: "دانشجو",

    login_title: "ورود",
    login_subtitle: "برای پیگیری درخواست خود وارد شوید",
    login_email: "ایمیل",
    login_password: "رمز عبور",
    login_submit: "ورود",
    login_switch_to_register: "حساب کاربری ندارید؟ ثبت‌نام کنید",
    register_title: "ثبت‌نام",
    register_full_name: "نام و نام خانوادگی",
    register_phone: "تلفن",
    register_nationality: "ملیت",
    register_submit: "ثبت‌نام",
    register_switch_to_login: "قبلاً حساب دارید؟ وارد شوید",
    auth_error_generic: "خطایی رخ داد، لطفاً دوباره تلاش کنید.",
    auth_admin_notice: "مدیران می‌توانند با همین فرم وارد شوند.",
    register_check_email: "لطفاً ایمیل خود را برای تأیید حساب بررسی کنید، سپس وارد شوید.",

    profile_title: "اطلاعات حساب",
    profile_full_name: "نام و نام خانوادگی",
    profile_email: "ایمیل",
    profile_role: "نقش",

    step_pre_registration: "پیش‌ثبت‌نام",
    step_documents_pending: "بارگذاری مدارک",
    step_under_review: "در حال بررسی",
    step_accepted: "نامه پذیرش",
    step_completed: "ثبت‌نام تکمیل شد",

    application_title: "جزئیات درخواست",
    application_target_program: "رشته / برنامه مورد نظر",
    application_target_university: "دانشگاه مورد نظر",
    application_save: "ذخیره",
    application_saved: "ذخیره شد",

    documents_title: "مدارک",
    document_status_missing: "بارگذاری نشده",
    document_status_pending: "در حال بررسی",
    document_status_approved: "تأیید شد",
    document_status_rejected: "رد شد",
    document_upload: "بارگذاری",
    document_replace: "جایگزینی",
    document_delete: "حذف",
    document_delete_confirm: "این مدرک حذف شود؟",
    document_optional_label: "(اختیاری)",
    document_view: "مشاهده",
    document_review_note: "یادداشت",

    acceptance_letter_title: "نامه پذیرش",
    acceptance_letter_none: "هنوز بارگذاری نشده",
    acceptance_letter_download: "دانلود",

    admin_title: "مدیریت درخواست‌ها",
    admin_search_placeholder: "جستجو بر اساس نام، ایمیل یا کشور...",
    admin_filter_all_status: "همه وضعیت‌ها",
    admin_filter_all_years: "همه سال‌ها",
    admin_filter_year: "سال ثبت‌نام",
    admin_table_name: "نام و نام خانوادگی",
    admin_table_nationality: "ملیت",
    admin_table_status: "وضعیت",
    admin_table_registered: "تاریخ ثبت‌نام",
    admin_table_updated: "آخرین بروزرسانی",
    admin_no_results: "نتیجه‌ای یافت نشد",
    admin_back_to_list: "بازگشت به فهرست",
    admin_advance_status: "بروزرسانی وضعیت",
    admin_upload_acceptance_letter: "بارگذاری نامه پذیرش",
    admin_approve: "تأیید",
    admin_reject: "رد",
    admin_reject_note_prompt: "دلیل رد (به دانشجو نمایش داده می‌شود):",
    admin_document_types_title: "انواع مدارک",
    admin_document_type_new_placeholder: "نام نوع مدرک جدید",
    admin_document_type_optional_hint: "در صورت خالی گذاشتن، از انگلیسی استفاده می‌شود.",
    admin_document_type_add: "افزودن",
    admin_document_type_edit: "ویرایش",
    admin_document_type_save: "ذخیره",
    admin_document_type_cancel: "لغو",
    admin_document_type_delete: "حذف",
    admin_document_type_delete_confirm: "این نوع مدرک حذف شود؟",
    admin_document_type_delete_in_use: "این نوع در حال استفاده است و حذف نمی‌شود. به‌جای آن غیرفعال کنید.",
    admin_document_type_deactivate: "غیرفعال کردن",
    admin_document_type_activate: "فعال کردن",
    admin_notes: "یادداشت‌ها",

    doctype_passport: "گذرنامه",
    doctype_diploma_transcript: "مدرک تحصیلی / ریز نمرات",
    doctype_photo: "عکس پرسنلی",
    doctype_language_certificate: "مدرک زبان",

    loading: "در حال بارگذاری...",
    not_authorized: "شما اجازه مشاهده این صفحه را ندارید.",
  },
  ru: {
    app_name: "Rota Education Consultancy",
    nav_logout: "Выйти",
    nav_logout_confirm: "Вы уверены, что хотите выйти?",
    role_admin: "Администратор",
    role_student: "Студент",

    login_title: "Вход",
    login_subtitle: "Войдите, чтобы отслеживать заявку",
    login_email: "Электронная почта",
    login_password: "Пароль",
    login_submit: "Войти",
    login_switch_to_register: "Нет аккаунта? Зарегистрируйтесь",
    register_title: "Регистрация",
    register_full_name: "ФИО",
    register_phone: "Телефон",
    register_nationality: "Гражданство",
    register_submit: "Зарегистрироваться",
    register_switch_to_login: "Уже есть аккаунт? Войти",
    auth_error_generic: "Произошла ошибка, попробуйте снова.",
    auth_admin_notice: "Администраторы могут входить через эту же форму.",
    register_check_email: "Проверьте почту, чтобы подтвердить аккаунт, затем войдите.",

    profile_title: "Данные аккаунта",
    profile_full_name: "ФИО",
    profile_email: "Электронная почта",
    profile_role: "Роль",

    step_pre_registration: "Предварительная регистрация",
    step_documents_pending: "Загрузка документов",
    step_under_review: "На рассмотрении",
    step_accepted: "Письмо о зачислении",
    step_completed: "Регистрация завершена",

    application_title: "Данные заявки",
    application_target_program: "Программа / специальность",
    application_target_university: "Университет",
    application_save: "Сохранить",
    application_saved: "Сохранено",

    documents_title: "Документы",
    document_status_missing: "Не загружено",
    document_status_pending: "На рассмотрении",
    document_status_approved: "Одобрено",
    document_status_rejected: "Отклонено",
    document_upload: "Загрузить",
    document_replace: "Заменить",
    document_delete: "Удалить",
    document_delete_confirm: "Удалить этот документ?",
    document_optional_label: "(необязательно)",
    document_view: "Просмотр",
    document_review_note: "Примечание",

    acceptance_letter_title: "Письмо о зачислении",
    acceptance_letter_none: "Ещё не загружено",
    acceptance_letter_download: "Скачать",

    admin_title: "Управление заявками",
    admin_search_placeholder: "Поиск по имени, email или стране...",
    admin_filter_all_status: "Все статусы",
    admin_filter_all_years: "Все годы",
    admin_filter_year: "Год регистрации",
    admin_table_name: "ФИО",
    admin_table_nationality: "Гражданство",
    admin_table_status: "Статус",
    admin_table_registered: "Дата регистрации",
    admin_table_updated: "Обновлено",
    admin_no_results: "Результатов не найдено",
    admin_back_to_list: "Назад к списку",
    admin_advance_status: "Изменить статус",
    admin_upload_acceptance_letter: "Загрузить письмо о зачислении",
    admin_approve: "Одобрить",
    admin_reject: "Отклонить",
    admin_reject_note_prompt: "Причина отклонения (будет видна студенту):",
    admin_document_types_title: "Типы документов",
    admin_document_type_new_placeholder: "Название нового типа документа",
    admin_document_type_optional_hint: "Если оставить пустым, используется английский.",
    admin_document_type_add: "Добавить",
    admin_document_type_edit: "Изменить",
    admin_document_type_save: "Сохранить",
    admin_document_type_cancel: "Отмена",
    admin_document_type_delete: "Удалить",
    admin_document_type_delete_confirm: "Удалить этот тип документа?",
    admin_document_type_delete_in_use: "Этот тип используется и не может быть удалён. Деактивируйте его.",
    admin_document_type_deactivate: "Деактивировать",
    admin_document_type_activate: "Активировать",
    admin_notes: "Заметки",

    doctype_passport: "Паспорт",
    doctype_diploma_transcript: "Диплом / Транскрипт",
    doctype_photo: "Фото",
    doctype_language_certificate: "Сертификат владения языком",

    loading: "Загрузка...",
    not_authorized: "У вас нет доступа к этой странице.",
  },
};

window.ROTA_LANGS = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fa", label: "فارسی" },
  { code: "ru", label: "Русский" },
];
window.ROTA_RTL_LANGS = ["ar", "fa"];

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
  function populateLangSelects() {
    document.querySelectorAll("[data-lang-select]").forEach((el) => {
      if (el.options.length) return;
      window.ROTA_LANGS.forEach(({ code, label }) => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = label;
        el.appendChild(opt);
      });
    });
  }
  function applyI18n() {
    populateLangSelects();
    const lang = getLang();
    document.documentElement.lang = lang;
    document.documentElement.dir = window.ROTA_RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-lang-select]").forEach((el) => {
      el.value = lang;
    });
  }
  const DOCTYPE_LANG_COLUMN = { tr: "label_tr", en: "label_en", ar: "label_ar", fa: "label_fa", ru: "label_ru" };

  // Varsayılan (seed edilen) evrak türleri için doctype_<key> çevirisi varsa
  // onu kullanır (eski veritabanlarıyla da geriye dönük uyumlu olsun diye);
  // aksi halde veritabanındaki seçili dile ait sütuna, o boşsa İngilizce/
  // Türkçe'ye döner.
  function docTypeLabel(documentType) {
    const i18nKey = "doctype_" + documentType.key;
    const translated = t(i18nKey);
    if (translated !== i18nKey) return translated;
    const col = DOCTYPE_LANG_COLUMN[getLang()];
    return (col && documentType[col]) || documentType.label_en || documentType.label_tr;
  }
  window.rotaI18n = { t, getLang, setLang, applyI18n, docTypeLabel };
  document.addEventListener("DOMContentLoaded", applyI18n);
})();
