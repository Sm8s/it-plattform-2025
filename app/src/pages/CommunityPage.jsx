import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

export default function CommunityPage() {
  const { session } = useAuth();
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('forum_threads')
        .select('id,title,created_at')
        .order('created_at', { ascending: false });
      setThreads(data || []);
    };
    load();
  }, []);

  const handleCreateThread = async e => {
    e.preventDefault();
    if (!session) return;
    if (!newThreadTitle.trim()) return;

    const { data, error } = await supabase.from('forum_threads').insert({
      title: newThreadTitle.trim(),
      created_by: session.user.id
    }).select('id,title,created_at').maybeSingle();

    if (!error && data) {
      setThreads(prev => [data, ...prev]);
      setNewThreadTitle('');
    }
  };

  return (
    <main className="section">
      <h2>Community Forum</h2>
      <p style={{ maxWidth: '40rem', opacity: .8 }}>
        Noch sehr minimal: hier siehst du Threads. Im Admin-Panel kannst du später Kategorien, Moderation,
        Pinning usw. ausbauen.
      </p>

      {session && (
        <form onSubmit={handleCreateThread} style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Titel deines Threads"
            value={newThreadTitle}
            onChange={e => setNewThreadTitle(e.target.value)}
            style={{
              padding: '.6rem .8rem',
              borderRadius: '.8rem',
              border: '1px solid rgba(148,163,184,0.6)',
              background: 'rgba(15,23,42,0.9)',
              color: '#e5e7eb',
              width: '100%',
              maxWidth: '400px',
              marginRight: '.5rem'
            }}
          />
          <button className="btn btn-primary" type="submit" style={{ marginTop: '.5rem' }}>
            Thread erstellen
          </button>
        </form>
      )}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {threads.map(t => (
          <li key={t.id} style={{ padding: '.7rem 0', borderBottom: '1px solid rgba(148,163,184,0.3)' }}>
            <div style={{ fontWeight: 500 }}>{t.title}</div>
            <div style={{ fontSize: '.75rem', opacity: .7 }}>
              {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
        {!threads.length && <li>Noch keine Threads vorhanden.</li>}
      </ul>
    </main>
  );
}
