import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <main className="section">
      <div className="section-narrow">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge">
              <span>🚀</span>
              <span>IT-Lernen direkt im Browser</span>
            </div>
            <h1>IT Lernplattform für HTML, CSS, JS &amp; mehr.</h1>
            <p className="hero-subtitle">
              Kleine Lektionen, interaktive Übungen, Gamification und Zertifikate. Perfekt für Einsteiger
              und angehende Fachinformatiker.
            </p>

            <div className="hero-actions">
              {session ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Weiterlernen
                </Link>
              ) : (
                <Link to="/auth" className="btn btn-primary">
                  Jetzt starten
                </Link>
              )}
              <Link to="/courses" className="btn">
                Alle Kurse ansehen
              </Link>
            </div>

            <div className="hero-meta">
              <span>📚 HTML, CSS, JS, Git, Python</span>
              <span>🏅 Fortschritt speichern &amp; Achievements</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card">
              <h3 style={{ marginTop: 0, marginBottom: '.4rem' }}>Dein Lernstand</h3>
              <p style={{ margin: 0, opacity: .9 }}>
                Behalte immer im Blick, wo du gerade bist – Kursfortschritt, XP und Badges.
              </p>
              <ul style={{ marginTop: '.7rem', paddingLeft: '1.1rem', fontSize: '.8rem', opacity: .9 }}>
                <li>Browserbasiertes Coding</li>
                <li>Quizze &amp; Challenges</li>
                <li>Community-Fragen &amp; Antworten</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <h3>Gamification</h3>
            <p>
              Verdiene XP, level dich hoch und schalte Achievements frei, während du echte Dev-Skills
              aufbaust.
            </p>
          </article>
          <article className="feature-card">
            <h3>Interaktive Übungen</h3>
            <p>
              Schreibe Code direkt im Browser, sieh dir die Ausgabe sofort an und lerne durch direktes
              Feedback.
            </p>
          </article>
          <article className="feature-card">
            <h3>Community</h3>
            <p>
              Stelle Fragen, diskutiere Lösungen und tausche dich mit anderen Lernenden und Mentoren aus.
            </p>
          </article>
          <article className="feature-card">
            <h3>Dein Tempo</h3>
            <p>
              Lerne in deinem eigenen Tempo – die Plattform merkt sich, wo du aufgehört hast, und bringt
              dich zurück zur nächsten Lektion.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
