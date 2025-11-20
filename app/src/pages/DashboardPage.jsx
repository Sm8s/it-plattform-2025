import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function DashboardPage() {
  const { session, profile } = useAuth();
  const [nextLesson, setNextLesson] = useState(null);
  const navigate = useNavigate();

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

  const displayName = profile?.username || session?.user?.email || 'Lernender';

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;

  const handleSecretLogoClick = () => {
    // kleines Easter Egg: 5x klicken öffnet Admin
    navigate('/admin');
  };

  return (
    <main className="section dashboard-page">
      {/* kleines verstecktes Logo oben rechts */}
      <button
        type="button"
        onClick={handleSecretLogoClick}
        aria-label="Admin Panel"
        className="dashboard-orb-button"
      >
        <span>◎</span>
      </button>

      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <p className="dashboard-eyebrow">Willkommen zurück</p>
          <h1 className="dashboard-title">Hi, {displayName}!</h1>
          <p className="dashboard-subtitle">
            Deine persönliche Startseite – behalte deinen Lernfortschritt im Blick und starte direkt in die
            nächste Session.
          </p>

          <div className="dashboard-hero-actions">
            <Link to="/courses" className="btn btn-primary">
              Weiterlernen
            </Link>
            <Link to="/projects" className="btn">
              Deine Projekte
            </Link>
          </div>

          <div className="dashboard-hero-meta">
            <div className="dashboard-meta-item">
              <span className="dashboard-meta-label">Level</span>
              <span className="dashboard-meta-value">{level}</span>
              <span className="dashboard-meta-description">Steige durch abgeschlossene Lektionen auf.</span>
            </div>
            <div className="dashboard-meta-item">
              <span className="dashboard-meta-label">Erfahrungspunkte</span>
              <span className="dashboard-meta-value">{xp}</span>
              <span className="dashboard-meta-description">XP sammelst du durch Kurse, Quizze und Projekte.</span>
            </div>
            <div className="dashboard-meta-item">
              <span className="dashboard-meta-label">Nächster Schritt</span>
              <span className="dashboard-meta-value">
                {nextLesson ? nextLesson.title_de || nextLesson.title_en : 'Noch kein Kurs gestartet'}
              </span>
              <span className="dashboard-meta-description">
                Wähle einen Kurs aus oder setze dort fort, wo du aufgehört hast.
              </span>
            </div>
          </div>
        </div>

        <aside className="dashboard-hero-card">
          <h2>Nächste Lektion</h2>
          {nextLesson ? (
            <>
              <p className="dashboard-hero-card-text">
                Als nächstes steht an:
              </p>
              <p className="dashboard-hero-card-title">
                {nextLesson.title_de || nextLesson.title_en}
              </p>
              <p className="dashboard-hero-card-text">
                Öffne den Kurs und arbeite die Lektion in deinem Tempo durch – dein Fortschritt wird automatisch
                gespeichert.
              </p>
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '0.8rem' }}>
                Lektion öffnen
              </Link>
            </>
          ) : (
            <>
              <p className="dashboard-hero-card-text">
                Du hast noch keinen Kurs gestartet. Such dir einen Bereich aus, der dich interessiert, und leg los.
              </p>
              <ul className="dashboard-hero-list">
                <li>HTML &amp; CSS – Grundlagen fürs Web</li>
                <li>JavaScript Basics – interaktive Seiten</li>
                <li>Python – Skripte, Automatisierung &amp; mehr</li>
              </ul>
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '0.8rem' }}>
                Kurse entdecken
              </Link>
            </>
          )}
        </aside>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Deine Lernreise</h2>
          <p>
            Diese Plattform ist darauf ausgelegt, dir viele kleine, machbare Schritte zu geben – statt dich mit
            riesigen Kursblöcken zu erschlagen.
          </p>
          <ul className="dashboard-list">
            <li>Kurze Lektionen mit klaren Zielen</li>
            <li>Direktes Feedback durch Quizzes &amp; Aufgaben</li>
            <li>Fortschritt wird automatisch gespeichert</li>
          </ul>
        </article>

        <article className="dashboard-card">
          <h2>Community &amp; Projekte</h2>
          <p>
            Lerne nicht allein: teile Fragen, Projekte und Lösungen mit anderen – oder nutze die Plattform einfach
            als persönliches Lern-Log.
          </p>
          <div className="dashboard-card-actions">
            <Link to="/community" className="btn">
              Zur Community
            </Link>
            <Link to="/projects" className="btn">
              Projekte ansehen
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
