import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const { session, profile } = useAuth();
  const [nextLesson, setNextLesson] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!session) return;

      const { data } = await supabase
        .from('lesson_progress')
        .select('lesson_id, status, lessons ( title_de, title_en )')
        .eq('user_id', session.user.id)
        .order('completed_at', { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setNextLesson(data[0].lessons);
      }
    };
    load();
  }, [session]);

  return (
    <main className="section">
      <h2>Dein Dashboard</h2>
      <p style={{ opacity: .85 }}>
        Willkommen zurück{profile?.username ? `, ${profile.username}` : ''}! Hier ist dein Überblick.
      </p>

      <div className="course-grid" style={{ marginTop: '1.5rem' }}>
        <div className="course-card">
          <h3>Lernen fortsetzen</h3>
          {nextLesson ? (
            <>
              <p style={{ fontSize: '.9rem' }}>
                Nächste Lektion: <strong>{nextLesson.title_de}</strong>
              </p>
              <Link to="/courses" className="btn btn-primary">
                Zu den Kursen
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: '.9rem' }}>
                Du hast noch keinen Kurs gestartet. Wähle einen Kurs aus, um zu beginnen.
              </p>
              <Link to="/courses" className="btn btn-primary">
                Kurse ansehen
              </Link>
            </>
          )}
        </div>

        <div className="course-card">
          <h3>Dein Fortschritt</h3>
          <p style={{ fontSize: '.9rem' }}>
            XP: <strong>{profile?.xp ?? 0}</strong><br />
            Level: <strong>{profile?.level ?? 1}</strong>
          </p>
          <Link to="/profile" className="btn">
            Profil anzeigen
          </Link>
        </div>

        <div className="course-card">
          <h3>Community</h3>
          <p style={{ fontSize: '.9rem' }}>
            Tausche dich mit anderen Lernenden aus, stelle Fragen und teile Lösungen.
          </p>
          <Link to="/community" className="btn">
            Zum Forum
          </Link>
        </div>
      </div>
    </main>
  );
}
