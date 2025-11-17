import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { locale } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      setCourse(courseData);

      if (courseData) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseData.id)
          .order('order_index', { ascending: true });

        setLessons(lessonsData || []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="section">Lade Kurs…</div>;
  if (!course) return <div className="section">Kurs nicht gefunden.</div>;

  const title = locale === 'de' ? course.title_de : course.title_en;
  const desc = locale === 'de' ? course.description_de : course.description_en;

  return (
    <main className="section">
      <h2>{title}</h2>
      <p style={{ maxWidth: '40rem', opacity: .85 }}>{desc}</p>
      <h3 style={{ marginTop: '2rem' }}>Lektionen</h3>
      <ul style={{ paddingLeft: 0, listStyle: 'none', marginTop: '.5rem' }}>
        {lessons.map(lesson => {
          const lessonTitle = locale === 'de' ? lesson.title_de : lesson.title_en;
          return (
            <li key={lesson.id} style={{ marginBottom: '.5rem' }}>
              <Link to={`/courses/${slug}/lessons/${lesson.id}`} className="btn">
                {lesson.order_index}. {lessonTitle}
              </Link>
            </li>
          );
        })}
        {!lessons.length && (
          <li>Für diesen Kurs wurden noch keine Lektionen angelegt (Admin-Panel verwenden).</li>
        )}
      </ul>
    </main>
  );
}
