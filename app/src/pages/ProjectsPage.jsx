import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ProjectsPage() {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [message, setMessage] = useState('');

  const loadProjects = async () => {
    if (!session) return;

    const [mine, pub] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('projects')
        .select('*, profiles ( username )')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);

    if (!mine.error) setMyProjects(mine.data || []);
    if (!pub.error) setPublicProjects(pub.data || []);
  };

  useEffect(() => {
    loadProjects();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;

    setSaving(true);
    setMessage('');

    const techArray = techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase.from('projects').insert({
      user_id: session.user.id,
      title,
      description,
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
      await loadProjects();
    }
    setSaving(false);
  };

  return (
    <main className="section">
      <div className="section-narrow">
        <header className="page-header">
          <h1 className="page-title">Deine Projekte</h1>
          <p className="page-subtitle">
            Sammle deine Lernprojekte – von Mini-Webseiten bis zu kleinen Tools – und teile sie optional mit der Community.
          </p>
        </header>

        <div className="projects-grid">
          {/* Formular */}
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Neues Projekt anlegen</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '.75rem 1rem' }}>
              <div>
                <label className="label">Titel</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="z.B. CSS Grid Playground"
                />
              </div>

              <div>
                <label className="label">Beschreibung</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Kurz, was das Projekt macht und was du gelernt hast."
                />
              </div>

              <div>
                <label className="label">Tech-Stack (Kommagetrennt)</label>
                <input
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="HTML, CSS, JS, React"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1fr)',
                  gap: '.6rem 1rem',
                }}
              >
                <div>
                  <label className="label">GitHub URL</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/…"
                  />
                </div>
                <div>
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
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem' }}>
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
                  {saving ? 'Speichere…' : 'Projekt speichern'}
                </button>
              </div>

              {message && (
                <div style={{ fontSize: '.8rem', opacity: .85, marginTop: '.1rem' }}>{message}</div>
              )}
            </form>
          </section>

          {/* Listen */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Meine Projekte</h2>
                <span className="card-subtitle">{myProjects.length} Einträge</span>
              </div>
              {myProjects.length === 0 ? (
                <p style={{ fontSize: '.85rem', opacity: .8 }}>Du hast noch keine Projekte angelegt.</p>
              ) : (
                <div className="projects-list">
                  {myProjects.map((p) => (
                    <article key={p.id} className="card" style={{ padding: '.7rem .9rem' }}>
                      <div className="card-header" style={{ marginBottom: '.3rem' }}>
                        <div style={{ fontSize: '.95rem', fontWeight: 500 }}>{p.title}</div>
                      </div>
                      <p style={{ fontSize: '.8rem', opacity: .9 }}>{p.description}</p>
                      {p.tech_stack && p.tech_stack.length > 0 && (
                        <div className="project-pill-row">
                          {p.tech_stack.map((t) => (
                            <span key={t} className="project-pill">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Öffentliche Galerie</h2>
                <span className="card-subtitle">
                  Projekte anderer Lernender – sortiert nach Datum.
                </span>
              </div>
              {publicProjects.length === 0 ? (
                <p style={{ fontSize: '.85rem', opacity: .8 }}>
                  Noch keine öffentlichen Projekte vorhanden.
                </p>
              ) : (
                <div className="projects-list">
                  {publicProjects.map((p) => (
                    <article key={p.id} className="card" style={{ padding: '.7rem .9rem' }}>
                      <div className="card-header" style={{ marginBottom: '.3rem' }}>
                        <div style={{ fontSize: '.95rem', fontWeight: 500 }}>{p.title}</div>
                        <span style={{ fontSize: '.75rem', opacity: .75 }}>
                          {p.profiles?.username || 'Anonym'}
                        </span>
                      </div>
                      <p style={{ fontSize: '.8rem', opacity: .9 }}>{p.description}</p>
                      <div className="project-pill-row">
                        {p.tech_stack?.map((t) => (
                          <span key={t} className="project-pill">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div style={{ marginTop: '.4rem', display: 'flex', gap: '.5rem', fontSize: '.8rem' }}>
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noreferrer">
                            GitHub
                          </a>
                        )}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noreferrer">
                            Live Demo
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
