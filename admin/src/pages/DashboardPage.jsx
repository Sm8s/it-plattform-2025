import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [users, courses, lessons, certs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('certificates').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        users: users?.count || 0,
        courses: courses?.count || 0,
        lessons: lessons?.count || 0,
        certificates: certs?.count || 0
      });
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">
            Überblick über Nutzer, Kurse und Aktivität auf deiner Lernplattform.
          </p>
        </div>
        <div className="dashboard-status-pill">
          <span className="status-dot" />
          Live‑System
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-icon">👤</div>
          <div className="kpi-meta">
            <span className="kpi-label">Benutzer</span>
            <span className="kpi-value">
              {loading ? '–' : stats.users.toLocaleString('de-DE')}
            </span>
            <span className="kpi-sub">Registrierte Accounts</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon">📚</div>
          <div className="kpi-meta">
            <span className="kpi-label">Kurse</span>
            <span className="kpi-value">
              {loading ? '–' : stats.courses.toLocaleString('de-DE')}
            </span>
            <span className="kpi-sub">Veröffentlichte Kurse</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon">🧩</div>
          <div className="kpi-meta">
            <span className="kpi-label">Lektionen</span>
            <span className="kpi-value">
              {loading ? '–' : stats.lessons.toLocaleString('de-DE')}
            </span>
            <span className="kpi-sub">Interaktive Inhalte</span>
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-icon">🏅</div>
          <div className="kpi-meta">
            <span className="kpi-label">Zertifikate</span>
            <span className="kpi-value">
              {loading ? '–' : stats.certificates.toLocaleString('de-DE')}
            </span>
            <span className="kpi-sub">Ausgestellte Zertifikate</span>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card activity-card">
          <div className="card-header">
            <h2>Nutzeraktivität</h2>
            <span className="pill pill-soft">Heute</span>
          </div>
          <p className="muted">
            Hier kannst du später Charts zu Logins, Kursfortschritt oder Abschlüssen einblenden.
          </p>
          <div className="activity-placeholder">
            <div className="activity-bar" />
            <div className="activity-bar" />
            <div className="activity-bar" />
            <div className="activity-bar" />
            <div className="activity-bar" />
          </div>
        </div>

        <div className="card quick-stats-card">
          <div className="card-header">
            <h2>Schnellüberblick</h2>
          </div>
          <ul className="quick-stats-list">
            <li>
              <span>Beliebtester Kurs</span>
              <span className="muted">Wird später aus Supabase geladen</span>
            </li>
            <li>
              <span>Neue Nutzer heute</span>
              <span className="muted">Statistik‑Widget Platzhalter</span>
            </li>
            <li>
              <span>Offene Support‑Tickets</span>
              <span className="muted">Kann an ein Ticket‑System angebunden werden</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
