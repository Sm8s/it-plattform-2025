import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

export default function CommunityPage() {
  const { session } = useAuth();
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  // project form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!session || !newThreadTitle.trim()) return;

    const { error } = await supabase.from('forum_threads').insert({
      title: newThreadTitle.trim(),
      user_id: session.user.id,
    });

    if (!error) {
      setNewThreadTitle('');
      const { data } = await supabase
        .from('forum_threads')
        .select('id,title,created_at')
        .order('created_at', { ascending: false });
      setThreads(data || []);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!session) {
      setMessage('Bitte melde dich an, um ein Projekt zu teilen.');
      return;
    }
    if (!title.trim()) {
      setMessage('Titel darf nicht leer sein.');
      return;
    }

    setSaving(true);
    setMessage('');

    const techArray = techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from('projects').insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      tech_stack: techArray,
      github_url: githubUrl || null,
      demo_url: demoUrl || null,
      is_public: isPublic,
    });

    if (error) {
      setMessage('Projekt konnte nicht gespeichert werden.');
    } else {
      setMessage('Projekt gespeichert.');
      setTitle('');
      setDescription('');
      setTechStack('');
      setGithubUrl('');
      setDemoUrl('');
      setIsPublic(true);
    }

    setSaving(false);
  };

  return (
    <main className="section">
      <div className="section-narrow">
        <header className="page-header">
          <h1 className="page-title">Community Forum</h1>
          <p className="page-subtitle">
            Stelle Fragen, starte Diskussionen und teile deine Lernprojekte mit der Community.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Threads */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Threads</h2>
              <p className="card-subtitle">
                Noch sehr minimal: hier siehst du Threads. Später kannst du Kategorien, Moderation usw. ausbauen.
              </p>
            </div>

            {session ? (
              <form onSubmit={handleCreateThread} style={{ marginBottom: '1rem' }}>
                <input
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  placeholder="Titel deines Threads"
                  className="input"
                  style={{ width: '100%', marginBottom: '.5rem' }}
                />
                <button className="btn btn-primary" type="submit">
                  Thread erstellen
                </button>
              </form>
            ) : (
              <p style={{ fontSize: '.85rem', opacity: 0.8, marginBottom: '.8rem' }}>
                Bitte melde dich an, um einen Thread zu erstellen.
              </p>
            )}

            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {threads.map((t) => (
                <li
                  key={t.id}
                  style={{ padding: '.7rem 0', borderBottom: '1px solid rgba(148,163,184,0.3)' }}
                >
                  <div style={{ fontWeight: 500 }}>{t.title}</div>
                  <div style={{ fontSize: '.75rem', opacity: 0.7 }}>
                    {new Date(t.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
              {!threads.length && <li>Noch keine Threads vorhanden.</li>}
            </ul>
          </section>

          {/* Projekt teilen */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Projekt mit der Community teilen</h2>
              <p className="card-subtitle">
                Lade ein Lernprojekt hoch – wähle, ob es nur für dich sichtbar ist oder in der öffentlichen Galerie.
              </p>
            </div>

            <form
              onSubmit={handleSubmitProject}
              style={{ display: 'grid', gap: '.75rem 1rem' }}
            >
              <div>
                <label className="label">Titel</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. CSS Grid Playground"
                />
              </div>

              <div>
                <label className="label">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Kurz, was das Projekt macht und was du gelernt hast."
                />
              </div>

              <div>
                <label className="label">Tech-Stack (kommagetrennt)</label>
                <input
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="HTML, CSS, JS, React"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="label">GitHub URL</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="form-field">
                  <label className="label">Live Demo URL</label>
                  <input
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://dein-projekt.vercel.app"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '.4rem',
                  gap: '.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.4rem',
                    fontSize: '.8rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <span>Projekt öffentlich in der Galerie anzeigen</span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ minWidth: '180px', justifyContent: 'center', display: 'inline-flex' }}
                >
                  {saving ? 'Speichern…' : 'Projekt speichern'}
                </button>
              </div>

              {message && (
                <p style={{ fontSize: '.8rem', marginTop: '.4rem', opacity: 0.9 }}>{message}</p>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
