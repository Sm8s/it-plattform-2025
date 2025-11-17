import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CoursesPage from './pages/CoursesPage';
import ContentPage from './pages/ContentPage';
import SettingsPage from './pages/SettingsPage';
import LogsPage from './pages/LogsPage';

function useAdminAuth() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session || null);
      setChecking(false);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, checking };
}

function Sidebar() {
  const location = useLocation();
  const link = (to, label) => (
    <Link
      to={to}
      style={{
        background: location.pathname === to ? 'rgba(148,163,184,.2)' : undefined
      }}
    >
      {label}
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Admin · IT Lernplattform</div>
      <nav className="sidebar-nav">
        {link('/', 'Dashboard')}
        {link('/users', 'Benutzerverwaltung')}
        {link('/courses', 'Kursverwaltung')}
        {link('/content', 'Content & Medien')}
        {link('/logs', 'Audit & Monitoring')}
        {link('/settings', 'Einstellungen / Theme')}
      </nav>
    </aside>
  );
}

export default function App() {
  const { session, checking } = useAdminAuth();

  if (checking) return <div style={{ padding: '2rem' }}>Prüfe Admin-Session…</div>;
  if (!session) {
    return (
      <div style={{ padding: '2rem', color: '#e5e7eb' }}>
        <h1>Admin Login</h1>
        <p>Bitte im Supabase Dashboard einen Magic-Link-Login oder Passwort-Login für Admins nutzen.</p>
        <p>
          Für ein richtiges Admin-Login kannst du eine spezielle Rolle (z.B. "admin") in der Tabelle
          <code> user_roles </code> setzen und eine eigene Login-Seite implementieren.
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="main-inner">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
