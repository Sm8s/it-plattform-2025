import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });
    setCourses(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const emptyCourse = {
    slug: '',
    title_de: '',
    title_en: '',
    description_de: '',
    description_en: '',
    difficulty: 'beginner',
    is_published: true
  };

  const startNew = () => setEditing(emptyCourse);

  const saveCourse = async e => {
    e.preventDefault();
    if (!editing.slug) return;
    if (editing.id) {
      await supabase.from('courses').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('courses').insert(editing);
    }
    setEditing(null);
    await load();
  };

  return (
    <>
      <div className="card">
        <h2>Kursverwaltung</h2>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={startNew}>
            Neuen Kurs anlegen
          </button>
        </div>
      </div>
      <div className="card">
        <h3>Kursliste</h3>
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>DE Title</th>
              <th>EN Title</th>
              <th>Level</th>
              <th>Veröffentlicht</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.slug}</td>
                <td>{c.title_de}</td>
                <td>{c.title_en}</td>
                <td>{c.difficulty}</td>
                <td>{c.is_published ? 'Ja' : 'Nein'}</td>
                <td>
                  <button className="btn" onClick={() => setEditing(c)}>
                    Bearbeiten
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="card">
          <h3>Kurs bearbeiten / erstellen</h3>
          <form onSubmit={saveCourse} style={{ display: 'grid', gap: '.6rem', maxWidth: '600px' }}>
            <label>
              <div>Slug</div>
              <input
                value={editing.slug}
                onChange={e => setEditing({ ...editing, slug: e.target.value })}
                required
              />
            </label>
            <label>
              <div>Title (DE)</div>
              <input
                value={editing.title_de}
                onChange={e => setEditing({ ...editing, title_de: e.target.value })}
                required
              />
            </label>
            <label>
              <div>Title (EN)</div>
              <input
                value={editing.title_en}
                onChange={e => setEditing({ ...editing, title_en: e.target.value })}
                required
              />
            </label>
            <label>
              <div>Beschreibung (DE)</div>
              <textarea
                value={editing.description_de}
                onChange={e => setEditing({ ...editing, description_de: e.target.value })}
              />
            </label>
            <label>
              <div>Beschreibung (EN)</div>
              <textarea
                value={editing.description_en}
                onChange={e => setEditing({ ...editing, description_en: e.target.value })}
              />
            </label>
            <label>
              <div>Difficulty</div>
              <select
                value={editing.difficulty}
                onChange={e => setEditing({ ...editing, difficulty: e.target.value })}
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={e => setEditing({ ...editing, is_published: e.target.checked })}
              />{' '}
              Veröffentlicht
            </label>
            <div>
              <button className="btn btn-primary" type="submit">
                Speichern
              </button>
              <button className="btn" type="button" onClick={() => setEditing(null)} style={{ marginLeft: '.5rem' }}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
