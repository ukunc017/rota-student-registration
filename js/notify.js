// Admin paneli → Edge Function `notify-student` çağrıları.
// Fonksiyon kurulu değilse sessizce hata döner; UI bozulmaz.
window.rotaNotify = (function () {
  const sb = () => window.rotaSupabase;

  async function extractInvokeError(error, data) {
    if (data && data.error) return String(data.error);
    const ctx = error && error.context;
    if (ctx) {
      try {
        if (typeof ctx.json === "function") {
          const body = await ctx.json();
          if (body && body.error) return String(body.error);
          if (body && body.message) return String(body.message);
        } else if (typeof ctx.text === "function") {
          const text = await ctx.text();
          if (text) return text.slice(0, 300);
        }
      } catch {
        /* ignore parse errors */
      }
    }
    return (error && error.message) || "notify failed";
  }

  async function notifyStudent(type, applicationId, meta) {
    if (!applicationId || !type) return { ok: false, error: "missing args" };
    try {
      const { data, error } = await sb().functions.invoke("notify-student", {
        body: { type, application_id: applicationId, meta: meta || {} },
      });
      if (data && data.ok === false) {
        console.warn("[rotaNotify]", type, data.error);
        return { ok: false, error: data.error || "notify failed" };
      }
      if (error) {
        const msg = await extractInvokeError(error, data);
        console.warn("[rotaNotify]", type, msg);
        return { ok: false, error: msg };
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

  async function deleteStudent(studentId) {
    if (!studentId) return { ok: false, error: "missing student_id" };
    try {
      const { data, error } = await sb().functions.invoke("delete-student", {
        body: { student_id: studentId },
      });
      if (data && data.ok === false) {
        console.warn("[rotaNotify] deleteStudent", data.error);
        return { ok: false, error: data.error || "delete failed" };
      }
      if (error) {
        const msg = await extractInvokeError(error, data);
        console.warn("[rotaNotify] deleteStudent", msg);
        return { ok: false, error: msg };
      }
      return { ok: true, data };
    } catch (err) {
      console.warn("[rotaNotify] deleteStudent", err);
      return { ok: false, error: err.message || String(err) };
    }
  }

  return { notifyStudent, missingDocLabels, deleteStudent };
})();

