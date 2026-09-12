// Supabase JS SDK'sı sayfalara <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js">
// ile CDN'den yükleniyor (window.supabase). Bu dosya tek bir client örneği oluşturup paylaşır.
(function () {
  const cfg = window.ROTA_CONFIG;
  if (!cfg || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes("YOUR-PROJECT")) {
    console.warn(
      "[Rota] js/config.js bulunamadı veya doldurulmadı. js/config.example.js dosyasını kopyalayıp Supabase bilgilerinizi girin."
    );
  }
  window.rotaSupabase = window.supabase.createClient(
    cfg ? cfg.SUPABASE_URL : "",
    cfg ? cfg.SUPABASE_ANON_KEY : ""
  );
})();
