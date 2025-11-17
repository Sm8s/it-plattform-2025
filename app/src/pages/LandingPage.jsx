import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { t } from '../i18n';

export default function LandingPage() {
  const { session, locale } = useAuth();

  return (
    <main>
      <section className="hero">
        <div>
          <div className="hero-title">
            Lerne Programmierung wie in einer App –
            <br />
            aber direkt im Browser.
          </div>
          <p className="hero-subtitle">
            Kleine Lektionen, interaktive Übungen, Gamification und Zertifikate. Perfekt für Einsteiger
            und angehende Fachinformatiker.
          </p>
          <div className="hero-actions">
            <Link to={session ? "/courses" : "/auth"} className="btn btn-primary">
              {session ? t(locale, 'continueLearning') : t(locale, 'getStarted')}
            </Link>
            <Link to="/courses" className="btn">
              Alle Kurse ansehen
            </Link>
          </div>
        </div>
        <div className="hero-grid">
          <div className="hero-card">
            <strong>Gamification</strong>
            <p>Verdiene XP, level dich hoch und schalte Achievements frei.</p>
          </div>
          <div className="hero-card">
            <strong>Interaktive Übungen</strong>
            <p>Code direkt im Browser schreiben und testen – ohne Installation.</p>
          </div>
          <div className="hero-card">
            <strong>Community</strong>
            <p>Stelle Fragen, diskutiere Lösungen und tausche dich mit anderen aus.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
