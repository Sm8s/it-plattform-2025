import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

export default function CoursesPage() {
  const { locale } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackCourses = [
    {
      id: 'html-basics-local',
      slug: 'html-basics',
      title_de: 'HTML Grundlagen',
      title_en: 'HTML Basics',
      description_de: 'Lerne das Grundgerüst jeder Webseite kennen.',
      description_en: 'Learn the basic structure of every website.',
      difficulty: 'beginner'
    },
    {
      id: 'css-basics-local',
      slug: 'css-basics',
      title_de: 'CSS Grundlagen',
      title_en: 'CSS Basics',
      description_de: 'Baue schöne Layouts und Styles.',
      description_en: 'Build beautiful layouts and styles.',
      difficulty: 'beginner'
    },
    {
      id: 'js-intro-local',
      slug: 'js-intro',
      title_de: 'JavaScript Einstieg',
      title_en: 'JavaScript Intro',
      description_de: 'Lerne die Programmiersprache des Webs.',
      description_en: 'Learn the programming language of the web.',
      difficulty: 'beginner'
    }
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses(fallbackCourses);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="section">
      <h2>Kurse</h2>
      <p style={{ opacity: .85, maxWidth: '40rem', fontSize: '.9rem' }}>
        Wähle einen Kurs aus, um mit dem Lernen zu beginnen. Dein Fortschritt wird automatisch gespeichert.
      </p>

      {loading && <p>Lade Kurse…</p>}

      <div className="course-grid" style={{ marginTop: '1rem' }}>
        {courses.map(course => {
          const title = locale === 'de' ? course.title_de : course.title_en;
          const desc = locale === 'de' ? course.description_de : course.description_en;
          return (
            <article key={course.id} className="course-card">
              <h3>{title}</h3>
              {course.difficulty && (
                <p style={{ fontSize: '.75rem', opacity: .8 }}>
                  Level: {course.difficulty}
                </p>
              )}
              {desc && (
                <p style={{ fontSize: '.85rem', opacity: .85, marginTop: '.4rem' }}>
                  {desc}
                </p>
              )}
              <Link
                to={`/courses/${course.slug}`}
                className="btn btn-primary"
                style={{ marginTop: '.8rem', display: 'inline-block' }}
              >
                Kurs öffnen
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
