import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LandingPage() {
  const { session } = useAuth();

  const primaryCtaHref = session ? '/dashboard' : '/auth';

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-hero-left">
          <p className="landing-eyebrow">CodeLearn · Deine IT Lernplattform</p>
          <h1 className="landing-title">
            Finde deinen Weg in die IT.
            <span className="landing-title-accent"> Schritt für Schritt.</span>
          </h1>
          <p className="landing-subtitle">
            Kleine Lektionen, interaktive Aufgaben und echte Projekte – alles in einem modernen Lern‑Dashboard.
            Perfekt für Einsteiger und angehende Fachinformatiker.
          </p>

          <div className="landing-cta-row">
            <Link to={primaryCtaHref} className="btn landing-btn-primary">
              {session ? 'Weiter zum Dashboard' : 'Jetzt starten'}
            </Link>
            <Link to="/courses" className="btn landing-btn-ghost">
              Kurse ansehen
            </Link>
          </div>

          <div className="landing-meta-row">
            <div className="landing-pill">HTML · CSS · JavaScript · Python</div>
            <div className="landing-metric">
              <span className="landing-metric-value">50+</span>
              <span className="landing-metric-label">Lerneinheiten</span>
            </div>
            <div className="landing-metric">
              <span className="landing-metric-value">100%</span>
              <span className="landing-metric-label">Browserbasiert</span>
            </div>
          </div>
        </div>

        <div className="landing-hero-right">
          <div className="landing-preview">
            <div className="landing-preview-header">
              <span className="landing-preview-pill">Nächste Lektion</span>
              <span className="landing-preview-status">Dein Fortschritt wird automatisch gespeichert</span>
            </div>
            <div className="landing-preview-main">
              <h2>Was ist HTML?</h2>
              <p>
                Lerne, wie Webseiten strukturiert sind, und schreibe deinen ersten eigenen Code direkt im Browser –
                mit sofortigem Feedback.
              </p>
              <div className="landing-preview-progress">
                <div className="landing-preview-progress-bar" />
                <span>1 / 8 Lektionen abgeschlossen</span>
              </div>
              <div className="landing-preview-actions">
                <Link to={primaryCtaHref} className="btn landing-btn-primary">
                  Lektion öffnen
                </Link>
                <span className="landing-preview-hint">Kein Account? Du kannst jederzeit kostenlos starten.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section-grid">
        <article className="landing-card">
          <h3>Interaktive Übungen</h3>
          <p>
            Löse Aufgaben direkt im Browser, sieh dir Ausgaben sofort an und lerne anhand von praktischen Beispielen,
            statt nur Theorie zu lesen.
          </p>
        </article>
        <article className="landing-card">
          <h3>Projekte statt nur Kapitel</h3>
          <p>
            Sammle deine Lernprojekte – von kleinen Tools bis zu Mini‑Webseiten – und nutze sie später als Portfolio
            für Bewerbungen.
          </p>
        </article>
        <article className="landing-card">
          <h3>Gamification & Motivation</h3>
          <p>
            Verdiene XP, level dich hoch und halte deinen Fortschritt in einem klaren Dashboard fest – so bleibst du
            dauerhaft am Ball.
          </p>
        </article>
      </section>
    </main>
  );
}
