const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY sind nicht gesetzt.");
}

// Supabase-Client mit Service-Role-Key (volle Rechte, keine RLS-Einschränkung)
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const userId = body.userId;

    if (!userId) {
      res.statusCode = 400;
      return res.json({ error: "userId fehlt" });
    }

    // HINWEIS:
    // Hier solltest du in einer echten Produktion unbedingt prüfen,
    // ob der Aufrufer wirklich ein Admin/Owner ist (z.B. Supabase-JWT validieren).
    // Für das Schul-/Demo-Projekt ist das hier bewusst einfach gehalten.

    // 1. Zugehörige Daten löschen (Profile, Rollen, Fortschritt etc.)
    // Passe die Tabellen bei Bedarf an dein eigenes Schema an.
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("lesson_progress").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 2. Auth-User löschen (entfernt den Login komplett)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("auth.admin.deleteUser Fehler:", authError);
      throw authError;
    }

    res.statusCode = 200;
    return res.json({ ok: true });
  } catch (err) {
    console.error("admin-delete-user Fehler:", err);
    res.statusCode = 500;
    return res.json({ error: "User konnte nicht gelöscht werden." });
  }
};
