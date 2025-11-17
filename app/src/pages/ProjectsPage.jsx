import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function ProjectsPage() {
  const { session, profile } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    github_url: '',
    demo_url: '',
    is_public: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const userId = session?.user?.id;

  const loadProjects = async () => {
    if (!userId) return;

    setLoading(true);
    // Eigene Projekte
    const { data: mine, error: mineErr } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!mineErr) setMyProjects(mine || []);

    // Öffentliche Projekte + Username
    const { data: pub, error: pubErr } = await supabase
      .from('projects')
      .select('*, profiles!inner(username)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!pubErr) setPublicProjects(pub || []);

    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [userId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId) return;
    if (!form.title.trim()) {
      setError('Titel darf nicht leer sein.');
      return;
    }
    setError('');
    setSaving(true);
    const { error: insertErr } = await supabase.from('projects').insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim(),
      tech_stack: form.tech_stack.trim(),
      github_url: form.github_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      is_public: form.is_public
    });
    setSaving(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setForm({
      title: '',
      description: '',
      tech_stack: '',
      github_url: '',
      demo_url: '',
      is_public: true
    });
    await loadProjects();
  };

  const handleDelete = async id => {
    if (!window.confirm('Projekt wirklich löschen?')) return;
    await supabase.from('projects').delete().eq('id', id);
    await loadProjects();
  };

  return (
    <main className="section">
      <h2>Deine Projekte</h2>
      <p style={{ maxWidth: '40rem', opacity: .85, fontSize: '.9rem' }}>
        Sammle hier kleine Projekte, die du während der Kurse baust – z.B. Mini-Webseiten, JS-Demos
        oder Python-Scripts. Du kannst sie optional öffentlich machen, damit andere Lernende sie sehen.
      </p>

      <section style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
        <h3>Neues Projekt anlegen</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: '.7rem', maxWidth: '520px', marginTop: '.5rem' }}
        >
          <div>
            <label style={{ fontSize: '.8rem' }}>Titel *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '.8rem' }}>Beschreibung</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div>
            <label style={{ fontSize: '.8rem' }}>Tech-Stack (z.B. HTML, CSS, JS)</label>
            <input
              name="tech_stack"
              value={form.tech_stack}
              onChange={handleChange}
            />
          </div>
          <div>
            <label style={{ fontSize: '.8rem' }}>GitHub URL</label>
            <input
              name="github_url"
              value={form.github_url}
              onChange={handleChange}
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label style={{ fontSize: '.8rem' }}>Live Demo URL</label>
            <input
              name="demo_url"
              value={form.demo_url}
              onChange={handleChange}
              placeholder="https://dein-projekt.netlify.app"
            />
          </div>
          <label style={{ fontSize: '.8rem' }}>
            <input
              type="checkbox"
              name="is_public"
              checked={form.is_public}
              onChange={handleChange}
              style={{ marginRight: '.4rem' }}
            />
            Projekt öffentlich in der Galerie anzeigen
          </label>
          {error && (
            <p style={{ color: '#fca5a5', fontSize: '.8rem' }}>{error}</p>
          )}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Speichere…' : 'Projekt speichern'}
          </button>
        </form>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3>Meine Projekte</h3>
        {loading && <p>Lade Projekte…</p>}
        <div className="course-grid">
          {myProjects.map(p => (
            <article key={p.id} className="course-card">
              <div className="course-chip">
                {p.is_public ? 'Öffentlich' : 'Privat'}
              </div>
              <h4>{p.title}</h4>
              {p.tech_stack && (
                <p style={{ fontSize: '.75rem', opacity: .8 }}>
                  Stack: {p.tech_stack}
                </p>
              )}
              {p.description && (
                <p style={{ fontSize: '.8rem', opacity: .85 }}>
                  {p.description}
                </p>
              )}
              <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ fontSize: '.75rem' }}
                  >
                    GitHub
                  </a>
                )}
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ fontSize: '.75rem' }}
                  >
                    Live Demo
                  </a>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleDelete(p.id)}
                  style={{ fontSize: '.75rem', marginLeft: 'auto' }}
                >
                  Löschen
                </button>
              </div>
            </article>
          ))}
          {!loading && myProjects.length === 0 && (
            <p style={{ fontSize: '.85rem', opacity: .8 }}>
              Du hast noch keine Projekte angelegt.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3>Öffentliche Galerie</h3>
        <p style={{ fontSize: '.85rem', opacity: .8 }}>
          Hier siehst du die neuesten öffentlichen Projekte anderer Lernender.
        </p>
        <div className="course-grid" style={{ marginTop: '.8rem' }}>
          {publicProjects.map(p => (
            <article key={p.id} className="course-card">
              <div className="course-chip">
                {p.profiles?.username || 'Anonym'}
              </div>
              <h4>{p.title}</h4>
              {p.tech_stack && (
                <p style={{ fontSize: '.75rem', opacity: .8 }}>
                  Stack: {p.tech_stack}
                </p>
              )}
              {p.description && (
                <p style={{ fontSize: '.8rem', opacity: .85 }}>
                  {p.description}
                </p>
              )}
              <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ fontSize: '.75rem' }}
                  >
                    GitHub
                  </a>
                )}
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    style={{ fontSize: '.75rem' }}
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </article>
          ))}
          {!loading && publicProjects.length === 0 && (
            <p style={{ fontSize: '.85rem', opacity: .8 }}>
              Noch keine öffentlichen Projekte vorhanden.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
