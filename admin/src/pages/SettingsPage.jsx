import React from 'react';

export default function SettingsPage() {
  return (
    <>
      <div className="card">
        <h2>Theme-Manager & Gamification-Steuerung</h2>
        <p style={{ fontSize: '.85rem', opacity: .85 }}>
          Hier kannst du später:
        </p>
        <ul style={{ fontSize: '.85rem', opacity: .85 }}>
          <li>Farbschemata der Plattform definieren</li>
          <li>XP-Regeln und Level-Kurven konfigurieren</li>
          <li>Feature-Flags für Beta-Funktionen (Forum, Chat, Zertifikate) setzen</li>
          <li>Backup & Restore-Workflows integrieren (z.B. über Supabase Backups / externe Tools)</li>
        </ul>
      </div>
    </>
  );
}
