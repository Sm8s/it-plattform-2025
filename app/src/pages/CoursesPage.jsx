import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

const FALLBACK_COURSES = [
  { slug: 'html-basics', title_de: 'HTML Grundlagen', title_en: 'HTML Basics', description_de: 'Baue das Grundgerüst jeder Webseite.', difficulty: 'beginner' },
  { slug: 'css-basics', title_de: 'CSS Grundlagen', title_en: 'CSS Basics', description_de: 'Lerne Layout, Farben und Responsive Design.', difficulty: 'beginner' },
  { slug: 'js-basics', title_de: 'JavaScript Grundlagen', title_en: 'JavaScript Basics', description_de: 'Programmiere interaktive Webseiten.', difficulty: 'beginner' },
  { slug: 'git-basics', title_de: 'Git & Versionierung', title_en: 'Git Basics', description_de: 'Versioniere deinen Code wie ein Profi.', difficulty: 'beginner' },
  { slug: 'python-basics', title_de: 'Python Grundlagen', title_en: 'Python Basics', description_de: 'Starte mit einer der beliebtesten Sprachen.', difficulty: 'beginner' }
];

export default function CoursesPage() {
  const { locale } = useAuth();
  const [courses, setCourses] = useState(FALLBACK_COURSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (!error && data?.length) {
        setCourses(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="section">
      <h2>Kurse</h2>
      {loading && <p>Lade Kurse…</p>}
      <div className="course-grid">
        {courses.map(course => {
          const title = locale === 'de' ? course.title_de : course.title_en;
          return (
            <Link key={course.slug} to={`/courses/${course.slug}`} className="course-card">
              <div className="course-chip">{course.difficulty}</div>
              <h3>{title}</h3>
              <p style={{ fontSize: '.85rem', opacity: .8 }}>{course.description_de}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
