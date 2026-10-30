// Supabase Edge Function — öğrenciye durum / evrak e-postası gönderir.
// Kurulum: README.md > E-posta bildirimleri
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type NotifyKind =
  | "document_approved"
  | "document_rejected"
  | "status_changed"
  | "acceptance_letter"
  | "documents_reminder";

interface NotifyBody {
  type: NotifyKind;
  application_id: string;
  meta?: {
    document_label?: string;
    review_note?: string;
    from_status?: string;
    to_status?: string;
    status_label?: string;
    missing_labels?: string[];
  };
}

const STATUS_LABELS: Record<string, { tr: string; en: string }> = {
  pre_registration: { tr: "Ön Kayıt", en: "Pre-registration" },
  documents_pending: { tr: "Evrak Yükleme", en: "Document upload" },
  under_review: { tr: "İnceleme", en: "Under review" },
  accepted: { tr: "Kabul Mektubu", en: "Acceptance letter" },
  completed: { tr: "Kayıt Tamamlandı", en: "Registration complete" },
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildEmail(kind: NotifyKind, name: string, meta: NotifyBody["meta"], siteUrl: string) {
  const greeting = `Merhaba ${name || "öğrenci"} / Hello ${name || "student"},`;
  const link = `${siteUrl.replace(/\/$/, "")}/student.html`;
  const footer = `\n\nDosyanızı görüntüleyin / View your file:\n${link}\n\n— Rota Education Consultancy`;

  let subject = "Rota — Başvuru güncellemesi / Application update";
  let body = greeting;

  switch (kind) {
    case "document_approved": {
      const label = meta?.document_label || "Document";
      subject = `Rota — Evrak onaylandı: ${label}`;
      body += `\n\n"${label}" evrakınız onaylandı.\nYour document "${label}" has been approved.`;
      break;
    }
    case "document_rejected": {
      const label = meta?.document_label || "Document";
      const note = meta?.review_note ? `\n\nNot / Note: ${meta.review_note}` : "";
      subject = `Rota — Evrak reddedildi: ${label}`;
      body += `\n\n"${label}" evrakınız reddedildi. Lütfen yeniden yükleyin.\nYour document "${label}" was rejected. Please upload again.${note}`;
      break;
    }
    case "status_changed": {
      const to = meta?.to_status || "";
      const label = STATUS_LABELS[to] || { tr: to, en: to };
      subject = `Rota — Durum: ${label.tr} / ${label.en}`;
      body += `\n\nBaşvuru durumunuz güncellendi: ${label.tr}.\nYour application status is now: ${label.en}.`;
      break;
    }
    case "acceptance_letter": {
      subject = "Rota — Kabul mektubunuz hazır / Acceptance letter ready";
      body +=
        "\n\nKabul mektubunuz yüklendi. Panelden indirebilirsiniz.\nYour acceptance letter is ready to download in your file.";
      break;
    }
    case "documents_reminder": {
      const list = (meta?.missing_labels || []).filter(Boolean);
      const bullets = list.length ? `\n\n• ${list.join("\n• ")}` : "";
      subject = "Rota — Eksik evrak hatırlatması / Missing documents";
      body += `\n\nBaşvurunuzda eksik veya yeniden yüklenmesi gereken evraklar var.\nSome documents are still missing or need to be re-uploaded.${bullets}`;
      break;
    }
  }

  return { subject, text: body + footer };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendKey = (Deno.env.get("RESEND_API_KEY") || "").trim();
    let fromEmail = (Deno.env.get("FROM_EMAIL") || "Rota <onboarding@resend.dev>").trim();
    // PowerShell bazen tırnakları değere gömebilir: "Rota <...>" → temizle
    if (
      (fromEmail.startsWith('"') && fromEmail.endsWith('"')) ||
      (fromEmail.startsWith("'") && fromEmail.endsWith("'"))
    ) {
      fromEmail = fromEmail.slice(1, -1).trim();
    }
    const siteUrl = (Deno.env.get("SITE_URL") || "http://localhost:3000").trim().replace(/^=+/, "");

    if (!resendKey) {
      return json(503, { ok: false, error: "RESEND_API_KEY not configured" });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { ok: false, error: "Missing Authorization" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) return json(401, { ok: false, error: "Invalid session" });

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      return json(403, { ok: false, error: "Admin only" });
    }

    const body = (await req.json()) as NotifyBody;
    if (!body?.type || !body?.application_id) {
      return json(400, { ok: false, error: "type and application_id required" });
    }

    const allowed: NotifyKind[] = [
      "document_approved",
      "document_rejected",
      "status_changed",
      "acceptance_letter",
      "documents_reminder",
    ];
    if (!allowed.includes(body.type)) {
      return json(400, { ok: false, error: "Invalid type" });
    }

    const { data: application, error: appErr } = await adminClient
      .from("applications")
      .select("id, student_id, status, profile:profiles!applications_student_id_fkey(full_name, email)")
      .eq("id", body.application_id)
      .single();
    if (appErr || !application) {
      return json(404, { ok: false, error: "Application not found" });
    }

    const student = application.profile as { full_name?: string; email?: string } | null;
    const emailTo = student?.email;
    if (!emailTo) {
      return json(422, { ok: false, error: "Student has no email" });
    }

    const { subject, text } = buildEmail(body.type, student?.full_name || "", body.meta || {}, siteUrl);

    const logInsert = await adminClient
      .from("notification_log")
      .insert({
        application_id: application.id,
        student_id: application.student_id,
        kind: body.type,
        payload: body.meta || {},
        email_to: emailTo,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (logInsert.error) {
      const msg = logInsert.error.message || "notification_log insert failed";
      if (/relation .*notification_log.* does not exist/i.test(msg) || logInsert.error.code === "42P01") {
        return json(503, {
          ok: false,
          error: "notification_log missing — run sql/add_notifications.sql in SQL Editor",
        });
      }
      // Tablo varsa ama insert yine de başarısızsa yine mail denemeye devam etme;
      // log olmadan da mail gidebilsin diye yalnızca uyarı olarak bırakıyoruz.
      console.warn("notification_log insert:", msg);
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [emailTo],
        subject,
        text,
      }),
    });
    const resendJson = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
      const errMsg =
        (resendJson as { message?: string }).message ||
        (resendJson as { error?: string }).error ||
        `Resend ${resendRes.status}`;
      if (logInsert.data?.id) {
        await adminClient
          .from("notification_log")
          .update({ error: errMsg })
          .eq("id", logInsert.data.id);
      }
      return json(502, { ok: false, error: errMsg });
    }

    if (logInsert.data?.id) {
      await adminClient
        .from("notification_log")
        .update({ sent_at: new Date().toISOString(), error: null })
        .eq("id", logInsert.data.id);
    }

    return json(200, { ok: true, email_to: emailTo });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json(500, { ok: false, error: message });
  }
});
