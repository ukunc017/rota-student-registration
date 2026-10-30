// Admin: öğrenci hesabını (auth + profil + başvuru + storage) siler.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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
    const { data: caller } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
    if (!caller || caller.role !== "admin") {
      return json(403, { ok: false, error: "Admin only" });
    }

    const body = await req.json().catch(() => ({}));
    const studentId = body?.student_id as string | undefined;
    if (!studentId) return json(400, { ok: false, error: "student_id required" });
    if (studentId === user.id) {
      return json(400, { ok: false, error: "Cannot delete your own account" });
    }

    const { data: target } = await adminClient
      .from("profiles")
      .select("id, role, email")
      .eq("id", studentId)
      .maybeSingle();
    if (!target) return json(404, { ok: false, error: "Student not found" });
    if (target.role === "admin") {
      return json(400, { ok: false, error: "Cannot delete an admin account here" });
    }

    // FK'ler (reviewed_by / changed_by / created_by) silmeyi engellemesin
    await adminClient.from("documents").update({ reviewed_by: null }).eq("reviewed_by", studentId);
    await adminClient.from("status_history").update({ changed_by: null }).eq("changed_by", studentId);
    await adminClient.from("notification_log").update({ created_by: null }).eq("created_by", studentId);

    // Öğrencinin başvurularına bağlı bildirim loglarını temizle
    const { data: apps } = await adminClient.from("applications").select("id").eq("student_id", studentId);
    const appIds = (apps || []).map((a) => a.id);
    if (appIds.length) {
      await adminClient.from("notification_log").delete().in("application_id", appIds);
      await adminClient.from("status_history").delete().in("application_id", appIds);
      await adminClient.from("documents").delete().in("application_id", appIds);
      await adminClient.from("applications").delete().eq("student_id", studentId);
    }
    await adminClient.from("notification_log").delete().eq("student_id", studentId);

    // Storage: öğrenci klasörü (owner FK de silmeyi engelleyebilir)
    const { data: files } = await adminClient.storage.from("documents").list(studentId, { limit: 1000 });
    if (files && files.length) {
      const paths = files.filter((f) => f.name).map((f) => `${studentId}/${f.name}`);
      if (paths.length) await adminClient.storage.from("documents").remove(paths);
    }

    // Profil satırını önce sil (auth.users cascade'e güvenmeden)
    await adminClient.from("profiles").delete().eq("id", studentId);

    const { error: delErr } = await adminClient.auth.admin.deleteUser(studentId);
    if (delErr) return json(502, { ok: false, error: delErr.message });

    return json(200, { ok: true, deleted: studentId, email: target.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json(500, { ok: false, error: message });
  }
});
