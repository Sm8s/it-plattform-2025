import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    lessons: 0,
    certificates: 0
  });

  useEffect(() => {
    const load = async () => {
      const [users, courses, lessons, certs] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('certificates').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        users: users.count || 0,
        courses: courses.count || 0,
        lessons: lessons.count || 0,
        certificates: certs.count || 0
      });
    };
    load();
  }, []);

  return (
    <>
      <div className="card">
        <h2>Live Dashboard</h2>
        <p>Überblick über Nutzer, Kurse und Aktivität. In Zukunft kannst du hier Charts, Live-Monitoring usw. einbauen.</p>
      </div>
      <div className="card">
        <h3>Kennzahlen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '.75rem', opacity: .7 }}>Nutzer</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.users}</div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', opacity: .7 }}>Kurse</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.courses}</div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', opacity: .7 }}>Lektionen</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.lessons}</div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', opacity: .7 }}>Zertifikate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.certificates}</div>
          </div>
        </div>
      </div>
    </>
  );
}
