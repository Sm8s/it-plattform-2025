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

  useEffect(() => {
    const checkRoleAndLoad = async () => {
      if (!session) return;

      // Rolle aus user_roles lesen
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
        // Wenn Owner, Stats laden
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
    <main className="section">
      <h2>Admin-Bereich (integriert)</h2>
      <p style={{ opacity: .85, maxWidth: '40rem' }}>
        Dies ist das interne Admin-Panel innerhalb der gleichen App. Der Zugang ist versteckt hinter dem
        Dashboard-Logo (5 Klicks). Hier kannst du nach und nach alle Admin-Funktionen ausbauen.
      </p>

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="course-grid">
          <div className="course-card">
            <h3>Übersicht</h3>
            <p style={{ fontSize: '.9rem' }}>
              Nutzer: <strong>{stats.users}</strong>
              <br />
              Kurse: <strong>{stats.courses}</strong>
              <br />
              Lektionen: <strong>{stats.lessons}</strong>
            </p>
          </div>
          <div className="course-card">
            <h3>Letzte Nutzer</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '.85rem' }}>
              {latestUsers.map(u => (
                <li key={u.id}>
                  {u.username || u.id.slice(0, 8)} –{' '}
                  {new Date(u.created_at).toLocaleDateString()}
                </li>
              ))}
              {!latestUsers.length && <li>Noch keine Nutzer gefunden.</li>}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
