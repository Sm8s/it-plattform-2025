import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminPanel() {
  const { session } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0
  });
  const [latestUsers, setLatestUsers] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const checkRoleAndLoad = async () => {
      if (!session) return;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles ( key )')
        .eq('user_id', session.user.id);

      if (!rolesError && roles) {
        const isOwnerRole = roles.some(r => r.roles?.key === 'owner');
        setIsOwner(isOwnerRole);
      }
      setCheckingRole(false);

      if (!rolesError) {
        const [usersCount, coursesCount, lessonsCount, latest] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('id, username, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        setStats({
          users: usersCount.count || 0,
          courses: coursesCount.count || 0,
          lessons: lessonsCount.count || 0
        });
        setLatestUsers(latest.data || []);
      }
    };

    checkRoleAndLoad();
  }, [session]);

  if (checkingRole) {
    return <main className="section">Prüfe Admin-Berechtigungen…</main>;
  }

  if (!isOwner) {
    return (
      <main className="section">
        <h2>Admin-Bereich</h2>
        <p style={{ opacity: .85 }}>
          Du hast keine Berechtigung, diesen Bereich zu sehen. Nur Nutzer mit der Rolle <code>owner</code> dürfen
          hier rein.
        </p>
      </main>
    );
  }

  return (
    <main className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div>
            <div className="admin-sidebar-title">Admin</div>
            <div style={{ fontSize: '.9rem', marginTop: '.3rem' }}>Dashboard</div>
          </div>

          <nav className="admin-sidebar-nav">
            <button
              type="button"
              className={`admin-sidebar-button ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <span>Übersicht</span>
              <span style={{ fontSize: '.7rem', opacity: .7 }}>Live</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar-button ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <span>Benutzer</span>
              <span style={{ fontSize: '.7rem', opacity: .7 }}>{stats.users}</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar-button ${activeSection === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveSection('courses')}
            >
              <span>Kurse</span>
              <span style={{ fontSize: '.7rem', opacity: .7 }}>{stats.courses}</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar-button ${activeSection === 'system' ? 'active' : ''}`}
              onClick={() => setActiveSection('system')}
            >
              <span>System</span>
              <span style={{ fontSize: '.7rem', opacity: .7 }}>OK</span>
            </button>
          </nav>

          <div style={{ fontSize: '.75rem', opacity: .8, marginTop: 'auto' }}>
            Eingeloggt als
            <br />
            <span style={{ fontWeight: 500 }}>{session?.user?.email}</span>
          </div>
        </aside>

        <section className="admin-main">
          <div className="admin-header-row">
            <div>
              <h2>Admin Dashboard</h2>
              <p style={{ fontSize: '.85rem', opacity: .8, marginTop: '.15rem' }}>
                Schneller Überblick über Nutzer, Kurse und Aktivitäten auf der Plattform.
              </p>
            </div>
            <div className="admin-tag">OWNER ACCESS</div>
          </div>

          <div className="admin-card-grid">
            <article className="admin-card">
              <h3>Nutzer</h3>
              <div className="admin-card-value">{stats.users}</div>
              <div className="admin-card-sub">Registrierte Accounts</div>
            </article>
            <article className="admin-card">
              <h3>Kurse</h3>
              <div className="admin-card-value">{stats.courses}</div>
              <div className="admin-card-sub">Verfügbare Kurse</div>
            </article>
            <article className="admin-card">
              <h3>Lektionen</h3>
              <div className="admin-card-value">{stats.lessons}</div>
              <div className="admin-card-sub">Gesamtanzahl</div>
            </article>
          </div>

          <div className="admin-card-grid">
            <article className="admin-table-card">
              <h3 style={{ marginTop: 0, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.12em', opacity: .7 }}>
                Letzte Nutzer
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Registriert am</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.username || u.id.slice(0, 8)}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {!latestUsers.length && (
                    <tr>
                      <td colSpan={2}>Noch keine Nutzer gefunden.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </article>

            <article className="admin-card">
              <h3>Systemstatus</h3>
              <div className="admin-card-value" style={{ fontSize: '1.1rem' }}>
                Online
              </div>
              <div className="admin-card-sub" style={{ marginTop: '.4rem' }}>
                Supabase-Backend aktiv, {stats.users} Nutzer geladen.
              </div>
              <p style={{ fontSize: '.75rem', opacity: .8, marginTop: '.6rem' }}>
                Hier kannst du später Logs, Fehler, Queues oder Cronjobs visualisieren.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
