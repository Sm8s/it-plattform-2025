import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabaseClient";

const SECTIONS = [
  { id: "overview", label: "Übersicht" },
  { id: "users", label: "Benutzerverwaltung" },
  { id: "courses", label: "Kursverwaltung" },
  { id: "texts", label: "Systemtexte" },
  { id: "roles", label: "Rollen & Rechte" },
  { id: "stats", label: "Statistiken" },
  { id: "logs", label: "Logs" },
  { id: "support", label: "Support-Anfragen" },
  { id: "billing", label: "Zahlungen" },
  { id: "integrations", label: "Integrationen" },
  { id: "api", label: "API-Zugriff" },
];

export default function AdminPanel() {
  const { session } = useAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0,
    completedLessons: 0,
    newUsers7Days: 0,
  });

  const [latestUsers, setLatestUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({}); // user_id -> [roleKey]

  const [courses, setCourses] = useState([]);
  const [lessonsByCourseId, setLessonsByCourseId] = useState({}); // course_id -> lessonCount

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkRole = async () => {
      if (!session || !supabase) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error: rolesError } = await supabase
          .from("user_roles")
          .select("roles ( key )");

        if (rolesError) {
          console.warn("Fehler beim Laden der Rollen:", rolesError.message);
          setIsOwner(false);
        } else {
          const hasOwner =
            data?.some((row) => row.roles?.key === "owner" || row.roles?.key === "admin") ??
            false;
          setIsOwner(hasOwner);
        }
      } catch (err) {
        console.warn("Fehler beim Rollen-Check:", err);
        setIsOwner(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkRole();
  }, [session]);

  useEffect(() => {
    if (!isOwner || !supabase) return;

    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [usersAgg, coursesAgg, lessonsAgg, completedAgg, latestProfiles, logs] =
          await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase.from("courses").select("id", { count: "exact", head: true }),
            supabase.from("lessons").select("id", { count: "exact", head: true }),
            supabase
              .from("lesson_progress")
              .select("id", { count: "exact", head: true })
              .eq("status", "completed"),
            supabase
              .from("profiles")
              .select("id, full_name, username, created_at, xp, level")
              .order("created_at", { ascending: false })
              .limit(6),
            supabase
              .from("audit_logs")
              .select("id, action, entity_type, created_at, meta")
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

        if (usersAgg.error) throw usersAgg.error;
        if (coursesAgg.error) throw coursesAgg.error;
        if (lessonsAgg.error) throw lessonsAgg.error;
        if (completedAgg.error) console.warn("lesson_progress Fehler:", completedAgg.error.message);
        if (latestProfiles.error) console.warn("profiles latest Fehler:", latestProfiles.error.message);
        if (logs.error) console.warn("audit_logs Fehler:", logs.error.message);

        let newUsers7Days = 0;
        if (latestProfiles.data) {
          newUsers7Days = latestProfiles.data.filter(
            (p) => p.created_at && p.created_at >= since7Days
          ).length;
        }

        setStats({
          users: usersAgg.count ?? 0,
          courses: coursesAgg.count ?? 0,
          lessons: lessonsAgg.count ?? 0,
          completedLessons: completedAgg.count ?? 0,
          newUsers7Days,
        });

        setLatestUsers(latestProfiles.data ?? []);
        setAuditLogs(logs.data ?? []);
      } catch (err) {
        console.error("Admin overview Fehler:", err);
        setError("Daten für das Admin-Dashboard konnten nicht vollständig geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [isOwner]);

  useEffect(() => {
    if (!isOwner || !supabase) return;

    const loadUsersAndRoles = async () => {
      try {
        const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, username, full_name, xp, level, created_at"),
            supabase.from("user_roles").select("user_id, roles ( key )"),
          ]);

        if (profilesError) console.warn("profiles Fehler:", profilesError.message);
        if (rolesError) console.warn("user_roles Fehler:", rolesError.message);

        setUsers(profiles ?? []);

        const map = {};
        roles?.forEach((row) => {
          const k = row.roles?.key;
          if (!k) return;
          if (!map[row.user_id]) map[row.user_id] = [];
          map[row.user_id].push(k);
        });
        setUserRoles(map);
      } catch (err) {
        console.error("Fehler beim Laden der Benutzerverwaltung:", err);
      }
    };

    const loadCourses = async () => {
      try {
        const [{ data: coursesData, error: coursesError }, { data: lessons, error: lessonsError }] =
          await Promise.all([
            supabase
              .from("courses")
              .select("id, slug, title_de, title_en, difficulty")
              .order("created_at", { ascending: true }),
            supabase.from("lessons").select("id, course_id"),
          ]);

        if (coursesError) console.warn("courses Fehler:", coursesError.message);
        if (lessonsError) console.warn("lessons Fehler:", lessonsError.message);

        setCourses(coursesData ?? []);

        const grouped = {};
        lessons?.forEach((l) => {
          if (!grouped[l.course_id]) grouped[l.course_id] = 0;
          grouped[l.course_id] += 1;
        });
        setLessonsByCourseId(grouped);
      } catch (err) {
        console.error("Fehler beim Laden der Kurse:", err);
      }
    };

    loadUsersAndRoles();
    loadCourses();
  }, [isOwner]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      return (
        u.username?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  if (checkingRole) {
    return (
      <main className="admin-shell">
        <div className="admin-center-message">Admin-Bereich wird geladen…</div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="admin-shell">
        <div className="admin-center-message">
          <h1>Kein Zugriff auf das Adminpanel</h1>
          <p>
            Dieser Bereich ist nur für Owner / Admin-Rollen freigeschaltet. Bitte melde dich mit einem
            berechtigten Account an.
          </p>
        </div>
      </main>
    );
  }

  const renderTopNav = () => (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <span className="admin-topbar-badge">Admin</span>
        <span className="admin-topbar-title">Control Center</span>
      </div>
      <nav className="admin-topbar-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/courses">Kurse</Link>
        <Link to="/projects">Projekte</Link>
        <Link to="/community">Community</Link>
        <button type="button" className="admin-topbar-link">
          Einstellungen
        </button>
        <button type="button" className="admin-topbar-link">
          Benachrichtigungen
        </button>
        <Link to="/profile">Profil</Link>
        <Link to="/">Zur Landingpage</Link>
      </nav>
    </header>
  );

  const renderOverview = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Plattform-Übersicht</h2>
          <p className="admin-subtitle">
            Echtzeit-Einblick in Nutzer, Kurse und Systemstatus deiner IT-Lernplattform.
          </p>
        </div>
        <div className="admin-tag">OWNER ACCESS</div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-grid admin-grid-3">
        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Registrierte Nutzer</div>
          <div className="admin-card-value">{stats.users}</div>
          <div className="admin-card-sub">+{stats.newUsers7Days} in den letzten 7 Tagen</div>
        </article>

        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Kurse & Lektionen</div>
          <div className="admin-card-value">
            {stats.courses} <span className="admin-card-unit">Kurse</span>
          </div>
          <div className="admin-card-sub">{stats.lessons} veröffentlichte Lektionen</div>
        </article>

        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Abgeschlossene Lektionen</div>
          <div className="admin-card-value">
            {stats.completedLessons}
            <span className="admin-card-unit"> insgesamt</span>
          </div>
          <div className="admin-card-sub">Lernaktivität über alle Nutzer hinweg</div>
        </article>
      </div>

      <div className="admin-grid admin-grid-2" style={{ marginTop: "1.75rem" }}>
        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Neueste Nutzer</h3>
            <span className="admin-pill">Onboarding</span>
          </header>
          <p className="admin-card-sub">
            Kürzlich registrierte Accounts mit XP & Level – ideal, um Feedback von frischen Nutzern
            einzuholen.
          </p>

          {latestUsers.length === 0 ? (
            <p className="admin-empty">Noch keine Profildaten verfügbar.</p>
          ) : (
            <ul className="admin-list">
              {latestUsers.map((u) => (
                <li key={u.id} className="admin-list-item">
                  <div>
                    <div className="admin-list-title">{u.full_name || u.username || "Unbekannt"}</div>
                    <div className="admin-list-sub">
                      Level {u.level ?? 1} • {u.xp ?? 0} XP
                    </div>
                  </div>
                  <div className="admin-list-meta">
                    <span className="admin-chip">Neu</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Systemstatus & Fehlerprotokolle</h3>
            <span className="admin-pill admin-pill-soft">System</span>
          </header>
          <p className="admin-card-sub">
            Ein schneller Blick auf die letzten Admin-Aktionen. Ideal, um Änderungen nachzuvollziehen.
          </p>

          {auditLogs.length === 0 ? (
            <p className="admin-empty">Noch keine Audit-Logs vorhanden.</p>
          ) : (
            <ul className="admin-list">
              {auditLogs.map((log) => (
                <li key={log.id} className="admin-list-item">
                  <div>
                    <div className="admin-list-title">{log.action}</div>
                    <div className="admin-list-sub">
                      {log.entity_type || "System"} •{" "}
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "Zeit unbekannt"}
                    </div>
                  </div>
                  <div className="admin-list-meta">
                    <span className="admin-dot" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );

  const renderUsers = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Benutzerverwaltung</h2>
          <p className="admin-subtitle">
            Durchsuche, filtere und analysiere Nutzer, Rollen und Lernfortschritt – alles an einem Ort.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="Nach Name, Benutzername oder ID suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-actions">
          <button type="button" className="btn">
            Filter
          </button>
          <button type="button" className="btn btn-primary">
            Export (CSV)
          </button>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <span>Nutzer</span>
          <span className="admin-table-meta">
            {filteredUsers.length} von {users.length} Profilen
          </span>
        </div>

        <div className="admin-table">
          <div className="admin-table-row admin-table-row-head">
            <div>Name</div>
            <div>Benutzername</div>
            <div>Level / XP</div>
            <div>Rollen</div>
            <div>Erstellt</div>
          </div>
          {filteredUsers.map((u) => (
            <div key={u.id} className="admin-table-row">
              <div>{u.full_name || "–"}</div>
              <div>{u.username || "–"}</div>
              <div>
                Level {u.level ?? 1} • {u.xp ?? 0} XP
              </div>
              <div>
                {(userRoles[u.id] || ["user"]).map((r) => (
                  <span key={r} className="admin-role-pill">
                    {r}
                  </span>
                ))}
              </div>
              <div>
                {u.created_at
                  ? new Date(u.created_at).toLocaleDateString()
                  : "–"}
              </div>
            </div>
          ))}
        </div>

        <p className="admin-hint">
          Rollen können aktuell nur über das Supabase-Dashboard angepasst werden. Du kannst diesen Bereich
          später erweitern, um Rollen direkt aus dem Frontend zu editieren (RBAC).
        </p>
      </div>
    </section>
  );

  const renderCourses = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Kursverwaltung</h2>
          <p className="admin-subtitle">
            Verwalte Kurse und Lektionen – inkl. Vorschau, Schwierigkeitsgrad und Struktur.
          </p>
        </div>
      </div>

      <div className="admin-grid admin-grid-2">
        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Alle Kurse</h3>
            <span className="admin-pill">
              {courses.length} Kurs{courses.length === 1 ? "" : "e"}
            </span>
          </header>
          <p className="admin-card-sub">
            Du kannst die Kursstruktur mental bereits hier planen – die Daten kommen direkt aus der
            Supabase-Tabelle <code>courses</code>.
          </p>

          {courses.length === 0 ? (
            <p className="admin-empty">
              Noch keine Kurse angelegt. In Supabase kannst du mit den Seeds aus <code>supabase/</code>{" "}
              starten.
            </p>
          ) : (
            <ul className="admin-list">
              {courses.map((c) => (
                <li key={c.id} className="admin-list-item">
                  <div>
                    <div className="admin-list-title">
                      {c.title_de || c.title_en || c.slug}
                    </div>
                    <div className="admin-list-sub">
                      {c.difficulty || "unbekannt"} •{" "}
                      {(lessonsByCourseId[c.id] ?? 0) || 0} Lektionen
                    </div>
                  </div>
                  <div className="admin-list-meta">
                    <Link
                      to={`/courses/${c.slug}`}
                      className="btn"
                      style={{ fontSize: ".75rem", paddingInline: ".9rem" }}
                    >
                      Vorschau
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Drag &amp; Drop Struktur (Konzept)</h3>
            <span className="admin-pill admin-pill-soft">Roadmap</span>
          </header>
          <p className="admin-card-sub">
            Hier könntest du später eine Drag-and-Drop-Verwaltung der Lektionen implementieren, die die
            Reihenfolge pro Kurs anpasst.
          </p>

          <div className="admin-dnd-placeholder">
            <div className="admin-dnd-item">01 – Einführung</div>
            <div className="admin-dnd-item">02 – Grundlagen</div>
            <div className="admin-dnd-item">03 – Projektaufgabe</div>
          </div>

          <p className="admin-hint">
            Für echtes Drag &amp; Drop könntest du z. B. <code>@dnd-kit</code> oder{" "}
            <code>react-beautiful-dnd</code> einsetzen und die Reihenfolge in einer{" "}
            <code>position</code>-Spalte der Tabelle <code>lessons</code> speichern.
          </p>
        </article>
      </div>
    </section>
  );

  const renderTexts = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Systemtexte &amp; Mehrsprachigkeit</h2>
          <p className="admin-subtitle">
            Konfiguration für Landingpage-Texte, Call-to-Actions und mehrsprachige Inhalte.
          </p>
        </div>
      </div>

      <div className="admin-grid admin-grid-2">
        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Landingpage Hero</h3>
            <span className="admin-pill">DE / EN</span>
          </header>
          <p className="admin-card-sub">
            Diese Werte könntest du in einer Tabelle <code>site_settings</code> speichern und hier direkt aus
            Supabase laden &amp; bearbeiten.
          </p>

          <form className="admin-form-grid">
            <label className="admin-field">
              <span>Hero Titel (DE)</span>
              <input defaultValue="Starte deine Karriere in der IT." />
            </label>
            <label className="admin-field">
              <span>Hero Titel (EN)</span>
              <input defaultValue="Kickstart your career in IT." />
            </label>
            <label className="admin-field admin-field-full">
              <span>Untertitel (DE)</span>
              <textarea defaultValue="Praxisnahe Kurse, echte Projekte und eine moderne Lernplattform." />
            </label>
            <label className="admin-field admin-field-full">
              <span>Untertitel (EN)</span>
              <textarea defaultValue="Hands-on courses, real projects and a modern learning experience." />
            </label>
            <div className="admin-form-actions">
              <button type="button" className="btn btn-primary">
                Änderungen speichern (Mock)
              </button>
            </div>
          </form>
        </article>

        <article className="admin-card">
          <header className="admin-card-header">
            <h3>Globale Einstellungen</h3>
            <span className="admin-pill admin-pill-soft">Konfiguration</span>
          </header>
          <p className="admin-card-sub">
            Hier kannst du steuern, welche Features global aktiv sind – z. B. Community, Projekte oder
            Zertifikate.
          </p>

          <div className="admin-toggle-row">
            <label>
              <input type="checkbox" defaultChecked /> Community-Bereich aktiv
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Projektgalerie aktiv
            </label>
            <label>
              <input type="checkbox" /> Zertifikate freigeben
            </label>
            <label>
              <input type="checkbox" /> Nur eingeladene Nutzer erlauben
            </label>
          </div>

          <p className="admin-hint">
            Diese Flags könntest du in einer <code>settings</code>-Tabelle speichern und beim Laden der App
            auswerten (Feature-Flags).
          </p>
        </article>
      </div>
    </section>
  );

  const renderRoles = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Rollen &amp; Berechtigungen</h2>
          <p className="admin-subtitle">
            Überblick über das RBAC-Modell (Roles &amp; Permissions) deiner Plattform.
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>Rollenmodell</h3>
          <span className="admin-pill">RBAC</span>
        </header>
        <p className="admin-card-sub">
          Im Supabase-Schema sind Rollen und User-Rollen bereits angelegt. Hier kannst du die
          Verantwortlichkeiten je Rolle dokumentieren.
        </p>

        <div className="admin-grid admin-grid-3 admin-role-grid">
          <div className="admin-role-card">
            <h4>Owner</h4>
            <ul>
              <li>Voller Zugriff auf alle Daten</li>
              <li>Kann Rollen &amp; Policies ändern</li>
              <li>Sieht Audit-Logs und Systemstatus</li>
            </ul>
          </div>
          <div className="admin-role-card">
            <h4>Admin</h4>
            <ul>
              <li>Moderation von Community &amp; Projekten</li>
              <li>Kursverwaltung</li>
              <li>Support-Anfragen bearbeiten</li>
            </ul>
          </div>
          <div className="admin-role-card">
            <h4>Support / Tutor</h4>
            <ul>
              <li>Fragen der Nutzer beantworten</li>
              <li>Kann Inhalte kommentieren</li>
              <li>Hat keinen Zugriff auf kritische Systemeinstellungen</li>
            </ul>
          </div>
        </div>

        <p className="admin-hint">
          Die eigentlichen Berechtigungen werden über Row-Level-Security-Policies (RLS) in Supabase
          umgesetzt. Die UI hier ist dein „Human-Readable Layer“ darüber.
        </p>
      </article>
    </section>
  );

  const renderStats = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Statistiken &amp; Nutzung</h2>
          <p className="admin-subtitle">
            Kennzahlen, die dir helfen, Wachstum und Engagement deiner Lernplattform zu verstehen.
          </p>
        </div>
      </div>

      <div className="admin-grid admin-grid-3">
        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Registrierte Nutzer</div>
          <div className="admin-card-value">{stats.users}</div>
          <div className="admin-card-sub">Gesamtzahl aller Profile in der Plattform.</div>
        </article>
        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Kurse</div>
          <div className="admin-card-value">{stats.courses}</div>
          <div className="admin-card-sub">Aktive Kurse im System.</div>
        </article>
        <article className="admin-card admin-card-metric">
          <div className="admin-card-label">Abgeschlossene Lektionen</div>
          <div className="admin-card-value">{stats.completedLessons}</div>
          <div className="admin-card-sub">Summe über alle Nutzer.</div>
        </article>
      </div>

      <article className="admin-card" style={{ marginTop: "1.75rem" }}>
        <header className="admin-card-header">
          <h3>Visualisierung &amp; Charts (Platzhalter)</h3>
          <span className="admin-pill admin-pill-soft">Analytics</span>
        </header>
        <p className="admin-card-sub">
          Hier könntest du mit Libraries wie <code>recharts</code> oder <code>nivo</code> Diagramme zu
          Aktivität, Kursabschlussquoten oder Funnel-Analysen darstellen.
        </p>

        <div className="admin-chart-placeholder">
          <div className="admin-chart-bar" />
          <div className="admin-chart-bar" />
          <div className="admin-chart-bar" />
          <div className="admin-chart-bar" />
          <div className="admin-chart-bar" />
        </div>
      </article>
    </section>
  );

  const renderLogs = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Audit-Logs</h2>
          <p className="admin-subtitle">
            Nachvollziehbarkeit von kritischen Aktionen – ideal für Debugging und Sicherheit.
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>Letzte Aktionen</h3>
          <span className="admin-pill">Audit</span>
        </header>

        {auditLogs.length === 0 ? (
          <p className="admin-empty">Noch keine Logs vorhanden.</p>
        ) : (
          <ul className="admin-list">
            {auditLogs.map((log) => (
              <li key={log.id} className="admin-list-item">
                <div>
                  <div className="admin-list-title">{log.action}</div>
                  <div className="admin-list-sub">
                    {log.entity_type || "System"} •{" "}
                    {log.created_at ? new Date(log.created_at).toLocaleString() : "Zeit unbekannt"}
                  </div>
                </div>
                <div className="admin-list-meta">
                  <span className="admin-dot admin-dot-warning" />
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="admin-hint">
          In der Tabelle <code>audit_logs</code> kannst du z. B. Kursänderungen, Rollenupdates oder kritische
          Aktionen loggen.
        </p>
      </article>
    </section>
  );

  const renderSupport = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Support-Anfragen</h2>
          <p className="admin-subtitle">
            Ein zentraler Platz, um Feedback, Bugs und Fragen der Nutzer zu sammeln.
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>Ticket-Übersicht (Konzept)</h3>
          <span className="admin-pill admin-pill-soft">Support</span>
        </header>
        <p className="admin-card-sub">
          Du kannst eine Tabelle <code>support_tickets</code> nutzen, um Anfragen zu speichern. Diese View
          zeigt dir offene Tickets, Priorität und Status.
        </p>

        <div className="admin-empty">
          Aktuell ist noch keine Ticket-Tabelle angebunden – die UI ist schon bereit dafür.
        </div>
      </article>
    </section>
  );

  const renderBilling = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Zahlungsverwaltung</h2>
          <p className="admin-subtitle">
            Übersicht über Abos, einmalige Käufe und Rechnungen (z. B. über Stripe / Paddle angebunden).
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>Abos &amp; Pläne</h3>
          <span className="admin-pill admin-pill-soft">Monetarisierung</span>
        </header>
        <p className="admin-card-sub">
          Plane hier deine Pricing-Modelle. Die eigentliche Integration (z. B. Stripe) kann später folgen – das
          Adminpanel ist bereits konzeptionell vorbereitet.
        </p>

        <ul className="admin-list">
          <li className="admin-list-item">
            <div>
              <div className="admin-list-title">Free Tier</div>
              <div className="admin-list-sub">Basiszugang, limitierte Kurse</div>
            </div>
            <div className="admin-list-meta">
              <span className="admin-chip">Aktiv</span>
            </div>
          </li>
          <li className="admin-list-item">
            <div>
              <div className="admin-list-title">Pro</div>
              <div className="admin-list-sub">Alle Kurse, Community, Projekte</div>
            </div>
            <div className="admin-list-meta">
              <span className="admin-chip admin-chip-pro">In Planung</span>
            </div>
          </li>
        </ul>
      </article>
    </section>
  );

  const renderIntegrations = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>Integrationen</h2>
          <p className="admin-subtitle">
            Verknüpfe externe Tools – z. B. Analytics, E-Mail-Provider oder Chat-Tools.
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>Verknüpfte Dienste (Konzept)</h3>
          <span className="admin-pill">Integrationen</span>
        </header>
        <p className="admin-card-sub">
          Du könntest eine Tabelle <code>integrations</code> verwenden, um Konfigurationen für Dienste wie
          Postmark, Resend, Stripe, Sentry oder Plausible zu speichern.
        </p>

        <div className="admin-grid admin-grid-3 admin-integration-grid">
          <div className="admin-integration-card">
            <h4>Analytics</h4>
            <p>Plausible, PostHog oder eigene Lösung.</p>
            <button type="button" className="btn">
              Konfigurieren
            </button>
          </div>
          <div className="admin-integration-card">
            <h4>E-Mail</h4>
            <p>SMTP, Postmark, Resend …</p>
            <button type="button" className="btn">
              Konfigurieren
            </button>
          </div>
          <div className="admin-integration-card">
            <h4>Error Tracking</h4>
            <p>Sentry, Logtail oder eigene Logs.</p>
            <button type="button" className="btn">
              Konfigurieren
            </button>
          </div>
        </div>
      </article>
    </section>
  );

  const renderApi = () => (
    <section>
      <div className="admin-header-row">
        <div>
          <h2>API-Zugriff</h2>
          <p className="admin-subtitle">
            Plane API-Keys und Zugriff für externe Tools – z. B. um Statistiken oder Kursdaten auszulesen.
          </p>
        </div>
      </div>

      <article className="admin-card">
        <header className="admin-card-header">
          <h3>API Keys (Konzept)</h3>
          <span className="admin-pill admin-pill-soft">Security</span>
        </header>
        <p className="admin-card-sub">
          Du könntest eine Tabelle <code>api_tokens</code> erstellen, die Tokens pro Integrationspartner
          speichert. Rate-Limits und Scopes lassen sich ebenfalls abbilden.
        </p>

        <div className="admin-table">
          <div className="admin-table-row admin-table-row-head">
            <div>Label</div>
            <div>Scope</div>
            <div>Erstellt</div>
            <div>Status</div>
          </div>
          <div className="admin-table-row">
            <div>Demo-Token</div>
            <div>read:stats</div>
            <div>–</div>
            <div>
              <span className="admin-chip">Beispiel</span>
            </div>
          </div>
        </div>

        <p className="admin-hint">
          Für echte Nutzung solltest du die Tokens serverseitig generieren und nur teilweise im Frontend
          anzeigen.
        </p>
      </article>
    </section>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "users":
        return renderUsers();
      case "courses":
        return renderCourses();
      case "texts":
        return renderTexts();
      case "roles":
        return renderRoles();
      case "stats":
        return renderStats();
      case "logs":
        return renderLogs();
      case "support":
        return renderSupport();
      case "billing":
        return renderBilling();
      case "integrations":
        return renderIntegrations();
      case "api":
        return renderApi();
      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <main className="admin-shell">
      {renderTopNav()}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Adminpanel</div>
          <p className="admin-sidebar-sub">
            Steuere Nutzer, Inhalte und Systemeinstellungen deiner Lernplattform zentral.
          </p>

          <nav className="admin-sidebar-nav">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={
                  "admin-sidebar-button" +
                  (activeSection === section.id ? " admin-sidebar-button-active" : "")
                }
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-footline">Eingeloggt als</div>
            <div className="admin-sidebar-email">{session?.user?.email}</div>
          </div>
        </aside>

        <section className="admin-main">{renderSection()}</section>
      </div>
    </main>
  );
}
