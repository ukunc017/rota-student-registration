// Ortak kimlik doğrulama yardımcıları. index.html (giriş/kayıt), student.html ve
// admin.html tarafından kullanılır. Roller "profiles" tablosunda tutulur.
(function () {
  const sb = () => window.rotaSupabase;

  async function signUp({ email, password, fullName, phone, nationality }) {
    // Ad/telefon/uyruk auth kullanıcısının metadata'sında saklanır, çünkü
    // e-posta doğrulaması açıksa signUp anında oturum (dolayısıyla RLS erişimi)
    // gelmeyebilir — profiles satırı ilk girişte ensureProfile() ile oluşturulur.
    const { data, error } = await sb().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, nationality } },
    });
    if (error) throw error;
    if (data.session) await ensureProfile(data.session);
    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await sb().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) await ensureProfile(data.session);
    return data;
  }

  async function signOut() {
    await sb().auth.signOut();
    window.location.href = "index.html";
  }

  // Var olan bir profili ASLA değiştirmez (admin rolüne yükseltilmiş bir
  // hesabın her girişte 'student'a döndürülmesini engeller) — sadece hiç
  // profil satırı yoksa oluşturur.
  async function ensureProfile(session) {
    const meta = session.user.user_metadata || {};
    await sb()
      .from("profiles")
      .upsert(
        {
          id: session.user.id,
          role: "student",
          full_name: meta.full_name || null,
          email: session.user.email,
          phone: meta.phone || null,
          nationality: meta.nationality || null,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
  }

  async function getCurrentProfile() {
    const {
      data: { session },
    } = await sb().auth.getSession();
    if (!session) return null;
    await ensureProfile(session);
    const { data: profile, error } = await sb()
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (error) return null;
    return { session, profile };
  }

  // Sayfayı yalnızca belirtilen role sahip, giriş yapmış kullanıcıya açar.
  // Aksi halde index.html'e yönlendirir. Sayfa yüklenince çağrılmalı.
  async function requireRole(role) {
    const result = await getCurrentProfile();
    if (!result || result.profile.role !== role) {
      window.location.href = "index.html";
      return null;
    }
    return result;
  }

  window.rotaAuth = { signUp, signIn, signOut, getCurrentProfile, requireRole };
})();
