import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

export default function ProfilePage() {
  const { session, profile } = useAuth();
  const [progress, setProgress] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data: prog } = await supabase
        .from('lesson_progress')
        .select('*, lessons ( title_de, title_en )')
        .eq('user_id', session.user.id);
      setProgress(prog || []);

      const { data: ev } = await supabase
        .from('gamification_events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setEvents(ev || []);
    };
    load();
  }, [session]);

  if (!session) return <main className="section">Nicht eingeloggt.</main>;

  return (
    <main className="section">
      <h2>Dein Profil</h2>
      <p>Email: {session.user.email}</p>
      {profile && (
        <p>
          XP: {profile.xp} • Level: {profile.level}
        </p>
      )}

      <h3 style={{ marginTop: '1.5rem' }}>Fortschritt</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {progress.map(p => (
          <li key={p.id} style={{ padding: '.4rem 0' }}>
            <strong>{p.lessons?.title_de}</strong> – {p.status} ({p.score ?? 0}%)
          </li>
        ))}
        {!progress.length && <li>Noch kein Fortschritt.</li>}
      </ul>

      <h3 style={{ marginTop: '1.5rem' }}>Letzte Gamification-Events</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {events.map(e => (
          <li key={e.id} style={{ padding: '.3rem 0', fontSize: '.85rem' }}>
            [{e.type}] XP: {e.xp_delta} • {new Date(e.created_at).toLocaleString()}
          </li>
        ))}
        {!events.length && <li>Noch keine Events.</li>}
      </ul>
    </main>
  );
}
