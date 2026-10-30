// Admin paneli → Edge Function `notify-student` çağrıları.
// Fonksiyon kurulu değilse sessizce hata döner; UI bozulmaz.
window.rotaNotify = (function () {
  const sb = () => window.rotaSupabase;

  async function notifyStudent(type, applicationId, meta) {
    if (!applicationId || !type) return { ok: false, error: "missing args" };
    try {
      const { data, error } = await sb().functions.invoke("notify-student", {
        body: { type, application_id: applicationId, meta: meta || {} },
      });
      if (error) {
        const msg = error.message || String(error);
        console.warn("[rotaNotify]", type, msg);
        return { ok: false, error: msg };
      }
      if (data && data.ok === false) {
        console.warn("[rotaNotify]", type, data.error);
        return { ok: false, error: data.error || "notify failed" };
      }
      return { ok: true, data };
    } catch (err) {
      console.warn("[rotaNotify]", type, err);
      return { ok: false, error: err.message || String(err) };
    }
  }

  function missingDocLabels(documentTypes, documentsByTypeId, labelFn) {
    const labels = [];
    (documentTypes || []).forEach((dt) => {
      if (!dt.active) return;
      const doc = documentsByTypeId[dt.id];
      const status = doc ? doc.status : "missing";
      if (status === "missing" || status === "rejected") {
        if (dt.required || status === "rejected") {
          labels.push(labelFn(dt));
        }
      }
    });
    return labels;
  }

  return { notifyStudent, missingDocLabels };
})();
