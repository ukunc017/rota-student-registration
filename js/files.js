// Ortak dosya tür / boyut kontrolleri (öğrenci evrak + admin kapak).
window.rotaFiles = (function () {
  const DOC_MAX_BYTES = 10 * 1024 * 1024;
  const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

  const DOC_TYPES = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  };

  const IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  };

  function extOf(name) {
    const m = String(name || "").toLowerCase().match(/(\.[a-z0-9]+)$/);
    return m ? m[1] : "";
  }

  function matches(file, typeMap) {
    const mime = (file.type || "").toLowerCase();
    const ext = extOf(file.name);
    if (mime && typeMap[mime]) {
      return !ext || typeMap[mime].includes(ext);
    }
    return Object.values(typeMap).some((exts) => exts.includes(ext));
  }

  function validateDocument(file) {
    if (!file) return { ok: false, errorKey: "file_error_missing" };
    if (!matches(file, DOC_TYPES)) return { ok: false, errorKey: "file_error_doc_type" };
    if (file.size > DOC_MAX_BYTES) return { ok: false, errorKey: "file_error_doc_size" };
    return { ok: true };
  }

  function validateImage(file) {
    if (!file) return { ok: false, errorKey: "file_error_missing" };
    if (!matches(file, IMAGE_TYPES)) return { ok: false, errorKey: "file_error_image_type" };
    if (file.size > IMAGE_MAX_BYTES) return { ok: false, errorKey: "file_error_image_size" };
    return { ok: true };
  }

  function acceptDocuments() {
    return ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";
  }

  function acceptImages() {
    return ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
  }

  function publicMediaUrl(path) {
    if (!path || !window.ROTA_CONFIG?.SUPABASE_URL) return "";
    return `${window.ROTA_CONFIG.SUPABASE_URL}/storage/v1/object/public/public-media/${path}`;
  }

  return {
    validateDocument,
    validateImage,
    acceptDocuments,
    acceptImages,
    publicMediaUrl,
    DOC_MAX_BYTES,
    IMAGE_MAX_BYTES,
  };
})();
